import { ref } from 'vue'

// Cached, reactive mirrors of the localStorage nick/avatar registries.
// Reading these used to mean JSON.parse(localStorage.getItem(...)) on every
// call site invocation (often per row, per render) — now it's parsed once
// and only re-parsed when refreshRegistries() is explicitly called after a write.
const nickRegistry = ref<Record<string, string>>({})
const avatarRegistry = ref<Record<string, string>>({})
let loaded = false

const readJson = (key: string): Record<string, string> => {
  try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} }
}

export const refreshRegistries = () => {
  if (!import.meta.client) return
  nickRegistry.value = readJson('_nick_registry')
  avatarRegistry.value = readJson('_avatar_registry')
  loaded = true
}

export const useUserRegistries = () => {
  if (!loaded && import.meta.client) refreshRegistries()
  return { nickRegistry, avatarRegistry, refreshRegistries }
}
