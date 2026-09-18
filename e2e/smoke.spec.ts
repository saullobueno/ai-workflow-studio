import { expect, test } from '@playwright/test'

test('sem sessão, a página inicial redireciona para o login', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'AI Workflow Studio' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /^entrar$/i })).toBeVisible()
})

test('login com as credenciais de demonstração leva à lista de workflows', async ({
  page,
}) => {
  await page.goto('/')
  // Credenciais já vêm preenchidas por padrão nos campos.
  await page.getByRole('button', { name: /^entrar$/i }).click()
  await expect(page).toHaveURL('/')
  await expect(
    page.getByRole('button', { name: /novo workflow/i }),
  ).toBeVisible()
})
