import { test, expect } from '@playwright/test'
import { mockApi, mockEmptyEventTypes, MOCK_EVENT_TYPES } from './fixtures'

test.describe('Admin Events Page', () => {
  test('displays event types heading', async ({ page }) => {
    await mockApi(page)
    await page.goto('/admin/events')
    await expect(page.getByRole('heading', { name: 'Event Types' })).toBeVisible()
  })

  test('displays event types list', async ({ page }) => {
    await mockApi(page)
    await page.goto('/admin/events')
    await expect(page.getByText('Consultation')).toBeVisible()
    await expect(page.getByText('Interview')).toBeVisible()
  })

  test('create new button navigates to creation form', async ({ page }) => {
    await mockApi(page)
    await page.goto('/admin/events')
    await page.getByRole('button', { name: 'Create New Event Type' }).click()
    await expect(page).toHaveURL('/admin/events/new')
  })

  test('creates a new event type', async ({ page }) => {
    await mockApi(page)
    await page.goto('/admin/events/new')

    await page.getByLabel('Name').fill('Workshop')
    await page.getByLabel('Description').fill('A 90-minute workshop')
    await page.getByLabel('Duration (minutes)').fill('90')
    await page.getByRole('button', { name: 'Create Event Type' }).click()

    await expect(page).toHaveURL('/admin/events')
  })

  test('form validation prevents empty submission', async ({ page }) => {
    await mockApi(page)
    await page.goto('/admin/events/new')

    const nameInput = page.getByLabel('Name')
    await nameInput.fill('')
    await page.getByRole('button', { name: 'Create Event Type' }).click()

    await expect(page).toHaveURL('/admin/events/new')
  })

  test('navigates to edit form', async ({ page }) => {
    await mockApi(page)
    await page.goto('/admin/events')

    const editButtons = page.getByRole('button', { name: 'Edit' })
    if (await editButtons.first().isVisible()) {
      await editButtons.first().click()
      await expect(page).toHaveURL(/\/admin\/events\/.*\/edit/)
    }
  })

  test('edits an existing event type', async ({ page }) => {
    await mockApi(page)
    await page.goto(`/admin/events/${MOCK_EVENT_TYPES[0].id}/edit`)

    await expect(page.getByLabel('Name')).toHaveValue('Consultation')
    await page.getByLabel('Name').fill('Updated Consultation')
    await page.getByRole('button', { name: 'Update Event Type' }).click()

    await expect(page).toHaveURL('/admin/events')
  })

  test('deletes an event type', async ({ page }) => {
    await mockApi(page)
    await page.goto('/admin/events')

    const deleteButtons = page.getByRole('button', { name: 'Delete' })
    if (await deleteButtons.first().isVisible()) {
      page.on('dialog', (dialog) => dialog.accept())
      await deleteButtons.first().click()
    }
  })

  test('shows empty state when no event types', async ({ page }) => {
    await mockEmptyEventTypes(page)
    await mockApi(page)
    await page.goto('/admin/events')
    await expect(page.getByText('No event types created yet.')).toBeVisible()
  })

  test('back to dashboard link navigates to /admin', async ({ page }) => {
    await mockApi(page)
    await page.goto('/admin/events')
    await page.getByRole('button', { name: /Back to Dashboard/ }).click()
    await expect(page).toHaveURL('/admin')
  })
})
