import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    unreadCount: 0,
  }),
  actions: {
    setUnread(n: number) { this.unreadCount = n },
  },
})
