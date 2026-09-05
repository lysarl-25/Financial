import { defineStore } from 'pinia'
import type { Toast } from '@/types'
import { uid } from '@/utils/format'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Toast[],
  }),
  actions: {
    push(message: string, variant: Toast['variant'] = 'success') {
      const toast: Toast = { id: uid('toast'), message, variant }
      this.toasts.push(toast)
      setTimeout(() => this.dismiss(toast.id), 3500)
    },
    dismiss(id: string) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
    success(message: string) {
      this.push(message, 'success')
    },
    error(message: string) {
      this.push(message, 'error')
    },
  },
})
