import { test, expect } from '@playwright/test'
import { mockApi } from './fixtures'

test.describe('Navigation', () => {
  test('clicking logo navigates to home page', async ({ page }) => {
    await mockApi(page)
    await page.goto('/admin')
    await page.getByRole('link', { name: 'Calendar Booking' }).click()
    await expect(page).toHaveURL('/')
  })

  test('admin link in header navigates to /admin', async ({ page }) => {
    await mockApi(page)
    await page.goto('/')
    await page.getByRole('link', { name: 'Admin' }).click()
    await expect(page).toHaveURL('/admin')
  })

  test('header is visible on all pages', async ({ page }) => {
    await mockApi(page)
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Calendar Booking' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible()

    await page.goto('/admin')
    await expect(page.getByRole('link', { name: 'Calendar Booking' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible()

    await page.goto('/booking/et-1')
    await expect(page.getByRole('link', { name: 'Calendar Booking' })).toBeVisible()
  })
})
