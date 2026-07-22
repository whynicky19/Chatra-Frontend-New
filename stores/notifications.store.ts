import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    unreadCount: 0,
    adminPending: 0,
  }),
  actions: {
    setUnread(n: number) { this.unreadCount = n },
    setAdminPending(n: number) { this.adminPending = n },
  },
})
