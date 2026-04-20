import { test, expect } from '@playwright/test'
import { mockApi, MOCK_EVENT_TYPE } from './fixtures'
import { format, addDays } from 'date-fns'

test.describe('Booking Flow', () => {
  test('displays event type info on booking page', async ({ page }) => {
    await mockApi(page)
    await page.goto(`/booking/${MOCK_EVENT_TYPE.id}`)
    await expect(page.getByText('Consultation')).toBeVisible()
    await expect(page.getByText('30-minute consultation call')).toBeVisible()
    await expect(page.getByText('30 min')).toBeVisible()
  })

  test('switches to Month view', async ({ page }) => {
    await mockApi(page)
    await page.goto(`/booking/${MOCK_EVENT_TYPE.id}`)
    await page.getByRole('button', { name: 'Month' }).click()
    await expect(page.getByText('Select Time')).toBeVisible()
  })

  test('switches to Week view', async ({ page }) => {
    await mockApi(page)
    await page.goto(`/booking/${MOCK_EVENT_TYPE.id}`)
    await page.getByRole('button', { name: 'Week' }).click()
    await expect(page.getByText('Select Time')).toBeVisible()
  })

  test('switches to List view', async ({ page }) => {
    await mockApi(page)
    await page.goto(`/booking/${MOCK_EVENT_TYPE.id}`)
    await page.getByRole('button', { name: 'List' }).click()
    await expect(page.getByText('Select Time')).toBeVisible()
  })

  test('selecting date in month view shows available slots', async ({ page }) => {
    await mockApi(page)
    await page.goto(`/booking/${MOCK_EVENT_TYPE.id}`)
    await page.getByRole('button', { name: 'Month' }).click()

    const tomorrow = addDays(new Date(), 1)
    const tomorrowDay = format(tomorrow, 'd')

    await page.getByRole('button', { name: new RegExp(`^${tomorrowDay}$`) }).first().click()
    await expect(page.getByText(/Available slots on/)).toBeVisible()
  })

  test('selecting a slot shows confirm booking button', async ({ page }) => {
    await mockApi(page)
    await page.goto(`/booking/${MOCK_EVENT_TYPE.id}`)
    await page.getByRole('button', { name: 'List' }).click()

    const firstAvailableSlot = page.getByRole('button', { name: /09:00 – 09:30/ }).first()
    if (await firstAvailableSlot.isVisible()) {
      await firstAvailableSlot.click()
      await expect(page.getByRole('button', { name: 'Confirm Booking' })).toBeVisible()
    }
  })

  test('back button returns to home page', async ({ page }) => {
    await mockApi(page)
    await page.goto(`/booking/${MOCK_EVENT_TYPE.id}`)
    await page.getByRole('button', { name: /Back/ }).click()
    await expect(page).toHaveURL('/')
  })

  test('navigates to confirm page after selecting slot', async ({ page }) => {
    await mockApi(page)
    await page.goto(`/booking/${MOCK_EVENT_TYPE.id}`)
    await page.getByRole('button', { name: 'List' }).click()

    const firstAvailableSlot = page.getByRole('button', { name: /09:00 – 09:30/ }).first()
    if (await firstAvailableSlot.isVisible()) {
      await firstAvailableSlot.click()
      await page.getByRole('button', { name: 'Confirm Booking' }).click()
      await expect(page).toHaveURL(/\/booking\/et-1\/confirm/)
    }
  })

  test('confirm form validates required fields', async ({ page }) => {
    await mockApi(page)
    const slot = encodeURIComponent('2026-04-21T10:00:00Z')
    await page.goto(`/booking/${MOCK_EVENT_TYPE.id}/confirm?slot=${slot}`)

    await page.getByRole('button', { name: 'Book Meeting' }).click()

    await expect(page.getByLabel('Your Name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
  })

  test('successful booking redirects to success page', async ({ page }) => {
    await mockApi(page)
    const slot = encodeURIComponent('2026-04-21T10:00:00Z')
    await page.goto(`/booking/${MOCK_EVENT_TYPE.id}/confirm?slot=${slot}`)

    await page.getByLabel('Your Name').fill('Test User')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Book Meeting' }).click()

    await expect(page).toHaveURL('/booking/success')
  })

  test('shows loading state for slots', async ({ page }) => {
    await page.route('**/api/slots**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await route.fulfill({ json: { eventTypeId: 'et-1', dates: {} } })
    })
    await mockApi(page)
    await page.goto(`/booking/${MOCK_EVENT_TYPE.id}`)
    await expect(page.getByText('Loading slots...')).toBeVisible()
  })
})
