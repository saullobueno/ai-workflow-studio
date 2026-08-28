import { expect, test } from '@playwright/test'

test('a página inicial carrega e mostra o título do app', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'AI Workflow Studio' }),
  ).toBeVisible()
})
