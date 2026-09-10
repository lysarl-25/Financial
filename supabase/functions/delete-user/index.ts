import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

async function purgeUserTrace(client: ReturnType<typeof createClient>, table: string, userId: string) {
  try {
    await client.from(table).delete().eq("user_id", userId)
  } catch {
    // Trace cleanup is best-effort and must never break the delete.
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Service role key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Capture the email before deletion so we can verify it becomes reusable.
    const { data: userRecord } = await supabase
      .from("auth.users")
      .select("email")
      .eq("id", userId)
      .maybeSingle<{ email: string | null }>()

    const email = userRecord?.email ?? null

    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      throw error
    }

    // Purge auth-internal ghost rows that otherwise keep the email reserved.
    for (const table of ["auth.identities", "auth.sessions", "auth.mfa_factors", "auth.flow_state"]) {
      await purgeUserTrace(supabase, table, userId)
    }

    // Verify no row still holds the deleted email; purge it if found.
    let emailReusable = true
    if (email) {
      const { data: remainingUsers } = await supabase
        .from("auth.users")
        .select("id")
        .eq("email", email)

      const { data: remainingIdentities } = await supabase
        .from("auth.identities")
        .select("id")
        .eq("email", email)

      const ghostUserIds = (remainingUsers ?? []).map((r: { id: string }) => r.id)
      const ghostIdentityIds = (remainingIdentities ?? []).map((r: { id: string; user_id: string }) => r.id)

      for (const identityId of ghostIdentityIds) {
        try {
          await supabase.from("auth.identities").delete().eq("id", identityId)
        } catch {
          // Best-effort.
        }
      }

      for (const id of ghostUserIds) {
        await purgeUserTrace(supabase, "auth.identities", id)
        try {
          await supabase.from("auth.users").delete().eq("id", id)
        } catch {
          // Best-effort.
        }
      }

      const { data: checkUsers } = await supabase
        .from("auth.users")
        .select("id")
        .eq("email", email)

      const { data: checkIdentities } = await supabase
        .from("auth.identities")
        .select("id")
        .eq("email", email)

      emailReusable = (checkUsers ?? []).length === 0 && (checkIdentities ?? []).length === 0
    }

    return new Response(
      JSON.stringify({ success: true, emailReusable, email }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete user"
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})