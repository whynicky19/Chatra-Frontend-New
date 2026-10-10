import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import AppDialog from '~/components/ui/AppDialog.vue'

const mounted: VueWrapper[] = []

const openDialog = (props: Record<string, unknown> = {}) => {
  const wrapper = mount(AppDialog, {
    attachTo: document.body,
    props: { labelledby: 'dialog-title', ...props },
    slots: {
      default: '<h2 id="dialog-title">Edit class</h2><input id="first"><button id="last">Save</button>',
    },
  })
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('AppDialog', () => {
  it('exposes modal semantics, names itself, focuses content, and locks scroll', async () => {
    const wrapper = openDialog()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(wrapper.get('[role="dialog"]').attributes('aria-modal')).toBe('true')
    expect(wrapper.get('[role="dialog"]').attributes('aria-labelledby')).toBe('dialog-title')
    expect(document.activeElement?.id).toBe('first')
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('traps Tab, closes on Escape, and restores focus', async () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()
    const wrapper = openDialog()
    await new Promise(resolve => setTimeout(resolve, 0))

    const last = wrapper.get('#last').element as HTMLElement
    last.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }))
    expect(document.activeElement?.id).toBe('first')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
    expect(document.activeElement).toBe(opener)
  })

  it('does not dismiss a busy destructive dialog', () => {
    const wrapper = openDialog({ busy: true, role: 'alertdialog' })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    expect(wrapper.emitted('close')).toBeUndefined()
    expect(wrapper.get('[role="alertdialog"]').attributes('aria-busy')).toBe('true')
  })
})
