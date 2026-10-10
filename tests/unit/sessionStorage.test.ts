import { describe, expect, it, vi } from 'vitest'
import { takeLegacyRefreshCredential } from '~/utils/sessionStorage'

describe('legacy web credential migration', () => {
  it('returns the old refresh credential once and removes both persisted tokens', () => {
    const values = new Map([['_tk', 'old-access'], ['_rtk', 'old-refresh']])
    const storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      removeItem: vi.fn((key: string) => values.delete(key)),
    }

    expect(takeLegacyRefreshCredential(storage)).toBe('old-refresh')
    expect(storage.removeItem).toHaveBeenCalledWith('_tk')
    expect(storage.removeItem).toHaveBeenCalledWith('_rtk')
    expect(values.size).toBe(0)
  })

  it('still removes a stale access token when no refresh credential exists', () => {
    const removed: string[] = []
    const storage = { getItem: () => null, removeItem: (key: string) => removed.push(key) }
    expect(takeLegacyRefreshCredential(storage)).toBeNull()
    expect(removed).toEqual(['_tk', '_rtk'])
  })
})
