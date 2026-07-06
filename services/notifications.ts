import { useApi } from './api'

export interface NotifState {
  notif_key: string
  read: boolean
  dismissed: boolean
}

// Состояние уведомлений (прочитано/скрыто) — серверная истина, чтобы совпадало
// с приложением. Ключи канонические: '{kind}:{ref_id}'.
export const useNotificationsSvc = () => {
  const api = useApi()

  return {
    states: async (): Promise<NotifState[]> => {
      try {
        const { data } = await api.get('/notifications/state')
        return data
      } catch {
        return []
      }
    },
    setState: async (notifKey: string, patch: { read?: boolean; dismissed?: boolean }) => {
      try {
        await api.post('/notifications/state', { notif_key: notifKey, ...patch })
      } catch {}
    },
    readAll: async (keys: string[]) => {
      try {
        await api.post('/notifications/read-all', { keys })
      } catch {}
    },
  }
}
