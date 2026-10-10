import { describe, expect, it } from 'vitest'
import { kindOf } from '~/utils/documentKind'

describe('safe document preview routing', () => {
  it.each(['report.xls', 'report.xlsx'])('%s is converted by the backend', (name) => {
    expect(kindOf(name)).toBe('office')
  })

  it('renders CSV as inert text', () => {
    expect(kindOf('report.csv')).toBe('text')
  })
})
