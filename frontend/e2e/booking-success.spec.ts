import { test, expect } from '@playwright/test'
import { mockApi } from './fixtures'

test.describe('Booking Success Page', () => {
  test('displays success message', async ({ page }) => {
    await mockApi(page)
    await page.goto('/booking/success')
    await expect(page.getByRole('heading', { name: 'Booking Confirmed!' })).toBeVisible()
    await expect(page.getByText('Your meeting has been successfully booked.')).toBeVisible()
    await expect(page.getByText('You will receive a confirmation email shortly.')).toBeVisible()
  })

  test('back to booking button navigates to home', async ({ page }) => {
    await mockApi(page)
    await page.goto('/booking/success')
    await page.getByRole('button', { name: 'Back to Booking' }).click()
    await expect(page).toHaveURL('/')
  })
})
