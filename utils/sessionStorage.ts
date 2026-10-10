type BrowserStorage = Pick<Storage, 'getItem' | 'removeItem'>

/**
 * Remove credentials persisted by web releases before AUD-005.
 * The refresh value is returned once so startup can exchange it for an
 * HttpOnly cookie; the access credential is never restored.
 */
export const takeLegacyRefreshCredential = (storage: BrowserStorage): string | null => {
  const legacyRefresh = storage.getItem('_rtk')
  storage.removeItem('_tk')
  storage.removeItem('_rtk')
  return legacyRefresh
}
