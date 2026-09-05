import { transactionService } from './transactionService'
import type { Transaction } from '@/types'

/**
 * Dashboard data is derived entirely from transactions, so this service
 * simply exposes the transaction list under a dashboard-friendly name.
 * Kept separate so a future backend could expose a dedicated aggregate
 * endpoint (e.g. /dashboard/summary) without touching UI code.
 */
export const dashboardService = {
  async getTransactions(): Promise<Transaction[]> {
    return transactionService.list()
  },
}
