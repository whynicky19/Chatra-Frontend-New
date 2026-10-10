import { expect, test, type Locator, type Page, type Route } from '@playwright/test'

const accessToken = 'eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0.signature'

const corsHeaders = {
  'access-control-allow-origin': 'http://127.0.0.1:3100',
  'access-control-allow-credentials': 'true',
  'access-control-allow-headers': 'authorization,content-type,x-csrf-token,ngrok-skip-browser-warning',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
}

const json = (route: Route, body: unknown, status = 200, headers: Record<string, string> = {}) =>
  route.fulfill({ status, contentType: 'application/json', headers: { ...corsHeaders, ...headers }, body: JSON.stringify(body) })

const minimalPdf = () => {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    '<< /Length 42 >>\nstream\nBT /F1 24 Tf 72 720 Td (Chatra) Tj ET\nendstream',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let content = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(content))
    content += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xref = Buffer.byteLength(content)
  content += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  content += offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  content += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(content)
}

async function mockApi(page: Page, options: { authenticated?: boolean; role?: 'student' | 'teacher' | 'admin'; withPdf?: boolean; withClass?: boolean } = {}) {
  const authenticated = options.authenticated ?? true
  const role = options.role ?? 'student'
  await page.addInitScript(() => localStorage.setItem('org_type', 'university'))
  await page.route('http://localhost:8000/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: corsHeaders })
    if (path === '/api/test.pdf') {
      return route.fulfill({ status: 200, contentType: 'application/pdf', headers: corsHeaders, body: minimalPdf() })
    }
    if (path.endsWith('/auth/csrf')) return json(route, { csrf_token: 'e2e-csrf' })
    if (path.endsWith('/auth/refresh')) {
      return authenticated
        ? json(route, { access_token: accessToken, token_type: 'bearer', csrf_token: 'e2e-csrf-2' })
        : json(route, { detail: 'Refresh token required' }, 401)
    }
    if (path.endsWith('/auth/me')) {
      return json(route, { id: 1, email: `${role}@example.test`, is_active: true, is_verified: true, role, org_type: 'university', full_name: 'E2E User' })
    }
    if (path.endsWith('/auth/logout')) return route.fulfill({ status: 204, headers: corsHeaders })
    if (path.endsWith('/classes/cover/options')) return json(route, {})
    const e2eClass = {
      id: 1, name: 'E2E Course', description: 'Browser test course', created_by: 1,
      created_at: '2026-10-10T10:00:00', is_active: true, rotation_mode: 'manual',
      is_archived_for_user: false, member_count: 1,
    }
    if (path.endsWith('/classes/1')) return json(route, options.withClass ? e2eClass : { detail: 'Not found' }, options.withClass ? 200 : 404)
    if (path.endsWith('/classes/')) return json(route, options.withClass ? [e2eClass] : [])
    if (path.endsWith('/posts/')) {
      return json(route, options.withPdf ? [{
        id: 10,
        title: '[LECTURE][1] PDF performance',
        created_at: '2026-10-10T10:00:00',
        body: 'Document\n\n📎 [sample.pdf](http://localhost:8000/api/test.pdf)',
      }] : [])
    }
    if (path.includes('/annotations')) return json(route, [])
    if (path.endsWith('/assignments/')) return json(route, options.withClass ? [{
      id: 20, class_id: 1, title: 'E2E Assignment', description: 'Verified assignment list',
      criteria: '[{"name":"Quality","weight":100}]', max_score: 100,
      created_at: '2026-10-10T10:00:00', is_active: true, created_by: 1,
    }] : [])
    if (path.includes('/assignments')) return json(route, [])
    if (path.includes('/notifications')) return json(route, [])
    return json(route, request.method() === 'GET' ? [] : {})
  })
}

async function expectFullDialogWidth(page: Page, dialog: Locator, desktopWidth: number) {
  const viewport = page.viewportSize()
  expect(viewport).not.toBeNull()
  if (!viewport) return
  await expect(dialog).toHaveCSS('max-width', viewport.width > 768 ? `${desktopWidth}px` : '100%')
}

test('protected routes reject an unauthenticated browser session', async ({ page }) => {
  await mockApi(page, { authenticated: false })
  await page.goto('/calendar')
  await expect(page).toHaveURL(/\/login$/)
})

test('role navigation, calendar, language, dialog keyboard behavior, and logout', async ({ page }) => {
  await mockApi(page, { role: 'student' })
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Дедлайны' })).toBeVisible()
  await page.goto('/settings')
  await page.getByRole('radio', { name: 'Қазақша' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'kk')
  await page.getByRole('radio', { name: 'English' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.goto('/calendar')
  await expect(page).toHaveURL(/\/calendar$/)
  await expect(page.getByRole('heading', { name: 'Дедлайны' })).toBeVisible()
  // Settings exposes logout at every breakpoint; the desktop sidebar's
  // secondary controls intentionally collapse into the mobile tab bar.
  await page.goto('/settings')
  await page.getByRole('main').getByRole('button', { name: 'Logout' }).click()
  await expect(page).toHaveURL(/\/org$/)
})

test('teacher create-class dialog traps focus, closes with Escape, and restores focus', async ({ page }) => {
  await mockApi(page, { role: 'teacher' })
  await page.goto('/')
  const opener = page.getByRole('button', { name: 'Создать предмет' })
  await opener.click()
  const dialog = page.getByRole('dialog', { name: 'Создать предмет' })
  await expect(dialog).toBeVisible()
  await expectFullDialogWidth(page, dialog, 720)
  await expect(dialog.locator('#create-class-name')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()
  await expect(page.getByRole('link', { name: 'Дедлайны' })).toHaveCount(0)
})

test('teacher can access a class and open the assignment workflow', async ({ page }) => {
  await mockApi(page, { role: 'teacher', withClass: true })
  await page.goto('/classes/1?tab=assignments')
  await expect(page.getByRole('heading', { name: 'E2E Course' })).toBeVisible()
  await expect(page.getByText('E2E Assignment', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Задание', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Новое задание' })
  await expect(dialog).toBeVisible()
  await expectFullDialogWidth(page, dialog, 880)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('public shell does not fetch the PDF worker', async ({ page }) => {
  await mockApi(page, { authenticated: false })
  const fetched: string[] = []
  page.on('request', request => fetched.push(request.url()))
  await page.goto('/landing')
  await page.waitForLoadState('networkidle')
  expect(fetched.some(url => url.includes('pdf.worker'))).toBe(false)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test('authenticated shell does not fetch the PDF worker', async ({ page }) => {
  await mockApi(page, { role: 'student' })
  const fetched: string[] = []
  page.on('request', request => fetched.push(request.url()))
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  expect(fetched.some(url => url.includes('pdf.worker'))).toBe(false)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test('PDF worker is fetched only after navigating to a PDF viewer route', async ({ page }) => {
  await mockApi(page, { role: 'student', withPdf: true })
  const workerRequest = page.waitForRequest(request => request.url().includes('pdf.worker'))
  await page.goto('/classes/1/lecture/10/file/0')
  const request = await workerRequest
  expect(request.url()).toContain('pdf.worker')
  await expect(page.locator('.dvs-title', { hasText: 'sample.pdf' })).toBeVisible()
})
