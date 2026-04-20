import { test, expect } from '@playwright/test'
import { mockApi, mockEmptyBookings, MOCK_BOOKINGS } from './fixtures'

test.describe('Admin Dashboard', () => {
  test('displays dashboard heading', async ({ page }) => {
    await mockApi(page)
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible()
  })

  test('displays statistics cards', async ({ page }) => {
    await mockApi(page)
    await page.goto('/admin')
    const confirmedCount = MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length.toString()
    const cancelledCount = MOCK_BOOKINGS.filter(b => b.status === 'cancelled').length.toString()
    const totalCount = MOCK_BOOKINGS.length.toString()

    await expect(page.getByText('Confirmed')).toBeVisible()
    await expect(page.getByText(confirmedCount)).toBeVisible()
    await expect(page.getByText('Cancelled')).toBeVisible()
    await expect(page.getByText(cancelledCount)).toBeVisible()
    await expect(page.getByText('Total')).toBeVisible()
    await expect(page.getByText(totalCount)).toBeVisible()
  })

  test('displays bookings calendar', async ({ page }) => {
    await mockApi(page)
    await page.goto('/admin')
    await expect(page.getByText('Bookings Calendar')).toBeVisible()
  })

  test('manage event types link navigates to /admin/events', async ({ page }) => {
    await mockApi(page)
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Manage Event Types' }).click()
    await expect(page).toHaveURL('/admin/events')
  })

  test('back to booking link navigates to /', async ({ page }) => {
    await mockApi(page)
    await page.goto('/admin')
    await page.getByRole('button', { name: 'Back to Booking' }).click()
    await expect(page).toHaveURL('/')
  })

  test('shows empty state when no bookings', async ({ page }) => {
    await mockApi(page)
    await mockEmptyBookings(page)
    await page.goto('/admin')
    await expect(page.getByText('0')).toBeVisible()
  })
})
