<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import * as Icons from 'lucide-vue-next'
import Modal from '@/components/common/Modal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import Button from '@/components/common/Button.vue'
import Input from '@/components/common/Input.vue'
import Select from '@/components/common/Select.vue'
import CardGridSkeleton from '@/components/common/CardGridSkeleton.vue'
import { useCategoryStore } from '@/stores/categoryStore'
import { useToastStore } from '@/stores/toastStore'
import type { Category, TransactionType } from '@/types'

const categoryStore = useCategoryStore()
const toastStore = useToastStore()

const activeTab = ref<TransactionType>('expense')
const formOpen = ref(false)
const editing = ref<Category | undefined>(undefined)
const deletingId = ref<string | null>(null)
const deleteBlocked = ref(false)

const iconOptions = [
  'Wallet', 
  'Laptop', 
  'Briefcase', 
  'TrendingUp', 
  'Gift', 
  'CircleDollarSign',
  'UtensilsCrossed', 
  'Car', 
  'ShoppingBag', 
  'Receipt', 
  'Film', 
  'HeartPulse',
  'GraduationCap', 
  'Home', 
  'Plane', 
  'MoreHorizontal', 
  'Coffee',
  'BookOpen',
  'Music',
  'Wifi',
  'Bike',
  'Rocket',
  'Package',
  'Droplets',
  'Shirt',
  'Pizza',
  'GlassWater',
  'Smartphone',
  'Tv',
  'Zap',
  'Fuel',
  'Bus',
  'Train',
  'PiggyBank',
  'Landmark',
  'CreditCard',
  'coins',
  'Banknote',
  'Flame',
  'Percent',
  'Building2',
  'Stethoscope',
  'Palette',
  'Wrench',
  'Hammer',
  'Drill',
  'PersonStanding',
  'Waves',
  'Milk',
  'CupSoda',
  'Banana',
  'Apple',
  'Citrus',
  'Cherry',
  'CookingPot',
  'Carrot',
  'Bean',
  'Salad',
  'Soup',
  'Medal',
  'Egg',
]
const colorOptions = ['#0f9d70', '#2e5b54', '#3f716a', '#0b7a58', '#5f8f85', '#e0603f', '#b8482c', '#d9784f', '#c25a38', '#e2825f']

const form = reactive({ name: '', type: 'expense' as TransactionType, icon: 'Tag', color: colorOptions[0] })
const errors = reactive({ name: '' })

const list = computed(() => (activeTab.value === 'income' ? categoryStore.incomeCategories : categoryStore.expenseCategories))

function iconFor(name?: string) {
  return (Icons as any)[name || 'Tag'] || Icons.Tag
}

function openCreate() {
  editing.value = undefined
  form.name = ''
  form.type = activeTab.value
  form.icon = 'Tag'
  form.color = colorOptions[0]
  errors.name = ''
  formOpen.value = true
}
function openEdit(c: Category) {
  editing.value = c
  form.name = c.name
  form.type = c.type
  form.icon = c.icon || 'Tag'
  form.color = c.color || colorOptions[0]
  errors.name = ''
  formOpen.value = true
}

async function handleSubmit() {
  errors.name = ''
  if (!form.name.trim()) {
    errors.name = 'Category name is required.'
    return
  }
  try {
    if (editing.value) {
      await categoryStore.update(editing.value.id, { name: form.name.trim(), type: form.type, icon: form.icon, color: form.color })
      toastStore.success('Category updated successfully.')
    } else {
      await categoryStore.create({ name: form.name.trim(), type: form.type, icon: form.icon, color: form.color })
      toastStore.success('Category created successfully.')
    }
    formOpen.value = false
  } catch {
    toastStore.error('Something went wrong. Please try again.')
  }
}

function requestDelete(id: string) {
  deletingId.value = id
  deleteBlocked.value = false
}

async function confirmDelete() {
  if (!deletingId.value) return
  const ok = await categoryStore.remove(deletingId.value)
  if (!ok) {
    deleteBlocked.value = true
    toastStore.error('This category is used by existing transactions and cannot be deleted.')
    return
  }
  toastStore.success('Category deleted successfully.')
  deletingId.value = null
}
</script>

<template>
  <div class="space-y-5">
    <div>
      <h2 class="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">Financial Categories</h2>
      <p class="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Organize and manage your income and expenses by category for better financial tracking.</p>
    </div>

    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="inline-flex rounded-xl bg-ink-100 dark:bg-ink-800 p-1">
        <button
          class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          :class="activeTab === 'expense' ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm' : 'text-ink-500'"
          @click="activeTab = 'expense'"
        >
          Expense
        </button>
        <button
          class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
          :class="activeTab === 'income' ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm' : 'text-ink-500'"
          @click="activeTab = 'income'"
        >
          Income
        </button>
      </div>
      <Button @click="openCreate"><Plus :size="16" /> New Category</Button>
    </div>

    <CardGridSkeleton v-if="categoryStore.loading && !categoryStore.loaded" :cards="6" />
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="c in list" :key="c.id" class="card p-4 flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <span class="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" :style="{ backgroundColor: c.color + '22' }">
            <component :is="iconFor(c.icon)" :size="18" :style="{ color: c.color }" />
          </span>
          <span class="font-medium text-ink-800 dark:text-ink-100 truncate">{{ c.name }}</span>
        </div>
        <div class="flex gap-1 shrink-0">
          <button class="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-500" @click="openEdit(c)">
            <Pencil :size="14" />
          </button>
          <button class="p-1.5 rounded-lg hover:bg-expense-light text-ink-500 hover:text-expense" @click="requestDelete(c.id)">
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>

    <Modal :open="formOpen" :title="editing ? 'Edit Category' : 'New Category'" @close="formOpen = false">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <Input v-model="form.name" label="Category Name" placeholder="e.g. Subscriptions" :error="errors.name" />
        <Select
          v-model="form.type"
          label="Type"
          :options="[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]"
        />
        <div>
          <label class="label">Icon</label>
          <div class="grid grid-cols-8 gap-2">
            <button
              v-for="icon in iconOptions"
              :key="icon"
              type="button"
              class="h-9 w-9 rounded-lg flex items-center justify-center border transition-colors"
              :class="form.icon === icon ? 'border-ink-800 bg-ink-100 dark:border-ink-200 dark:bg-ink-800' : 'border-ink-200 dark:border-ink-700'"
              @click="form.icon = icon"
            >
              <component :is="iconFor(icon)" :size="16" />
            </button>
          </div>
        </div>
        <div>
          <label class="label">Color</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in colorOptions"
              :key="color"
              type="button"
              class="h-8 w-8 rounded-full border-2 transition-transform"
              :class="form.color === color ? 'border-ink-800 dark:border-white scale-110' : 'border-transparent'"
              :style="{ backgroundColor: color }"
              @click="form.color = color"
            />
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" @click="formOpen = false">Cancel</Button>
          <Button type="submit">Save Category</Button>
        </div>
      </form>
    </Modal>

    <ConfirmDialog
      :open="!!deletingId && !deleteBlocked"
      message="This will permanently delete the category. This action cannot be undone."
      @confirm="confirmDelete"
      @cancel="deletingId = null"
    />
  </div>
</template>
