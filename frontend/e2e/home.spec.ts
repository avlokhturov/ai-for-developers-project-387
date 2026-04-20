import { test, expect } from '@playwright/test'
import { mockApi, mockEmptyEventTypes } from './fixtures'

test.describe('Home Page', () => {
  test('displays heading and subheading', async ({ page }) => {
    await mockApi(page)
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Book a Meeting' })).toBeVisible()
    await expect(page.getByText('Select an event type to book a time slot')).toBeVisible()
  })

  test('displays event type cards', async ({ page }) => {
    await mockApi(page)
    await page.goto('/')
    await expect(page.getByText('Consultation')).toBeVisible()
    await expect(page.getByText('30-minute consultation call')).toBeVisible()
    await expect(page.getByText('Interview')).toBeVisible()
    await expect(page.getByText('60-minute technical interview')).toBeVisible()
    await expect(page.getByText('30 minutes')).toBeVisible()
    await expect(page.getByText('60 minutes')).toBeVisible()
  })

  test('clicking event type card navigates to booking page', async ({ page }) => {
    await mockApi(page)
    await page.goto('/')
    await page.getByText('Consultation').click()
    await expect(page).toHaveURL(/\/booking\/et-1/)
  })

  test('shows empty state when no event types', async ({ page }) => {
    await mockEmptyEventTypes(page)
    await mockApi(page)
    await page.goto('/')
    await expect(page.getByText('No event types available yet.')).toBeVisible()
  })

  test('admin dashboard link navigates to /admin', async ({ page }) => {
    await mockApi(page)
    await page.goto('/')
    await page.getByRole('button', { name: 'Admin Dashboard' }).click()
    await expect(page).toHaveURL('/admin')
  })

  test('shows loading state', async ({ page }) => {
    await page.route('**/api/event-types', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await route.fulfill({ json: [] })
    })
    await page.goto('/')
    await expect(page.getByText('Loading...')).toBeVisible()
  })
})
