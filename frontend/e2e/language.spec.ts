import { test, expect } from '@playwright/test'
import { mockApi } from './fixtures'

test.describe('Language Switching', () => {
  test('switches from English to Russian', async ({ page }) => {
    await mockApi(page)
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Book a Meeting' })).toBeVisible()

    await page.getByRole('button', { name: 'Switch to Русский' }).click()

    await expect(page.getByRole('heading', { name: 'Забронируйте встречу' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Switch to English' })).toBeVisible()
  })

  test('switches from Russian back to English', async ({ page }) => {
    await mockApi(page)
    await page.goto('/')

    await page.getByRole('button', { name: 'Switch to Русский' }).click()
    await expect(page.getByRole('heading', { name: 'Забронируйте встречу' })).toBeVisible()

    await page.getByRole('button', { name: 'Switch to English' }).click()
    await expect(page.getByRole('heading', { name: 'Book a Meeting' })).toBeVisible()
  })

  test('language persists when navigating to admin', async ({ page }) => {
    await mockApi(page)
    await page.goto('/')

    await page.getByRole('button', { name: 'Switch to Русский' }).click()
    await expect(page.getByRole('heading', { name: 'Забронируйте встречу' })).toBeVisible()

    await page.getByRole('link', { name: 'Админ' }).click()
    await expect(page.getByRole('heading', { name: 'Панель администратора' })).toBeVisible()
  })
})
