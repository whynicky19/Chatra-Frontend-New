import { describe, expect, it } from 'vitest'
import { applyDocumentLanguage } from '~/composables/useI18n'

describe('document language synchronization', () => {
  it.each(['ru', 'kk', 'en'] as const)('sets the root language to %s', (language) => {
    applyDocumentLanguage(document, language)
    expect(document.documentElement.lang).toBe(language)
  })
})
