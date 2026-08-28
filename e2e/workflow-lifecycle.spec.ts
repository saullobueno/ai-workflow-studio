import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('cria o workflow de exemplo, executa e vê o histórico', async ({
  page,
}) => {
  await page.getByRole('combobox', { name: /começar com um exemplo/i }).click()
  await page
    .getByRole('option', { name: 'Ticket VIP com sentimento negativo' })
    .click()

  await expect(page).toHaveURL(/\/workflows\//)
  await expect(page.getByText('Novo ticket de suporte')).toBeVisible()
  await expect(page.getByText('Classificar urgência com IA')).toBeVisible()

  await page.getByRole('button', { name: /^executar$/i }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Histórico de execução')).toBeVisible()
  await expect(dialog.getByText('Classificar urgência com IA')).toBeVisible()

  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /voltar para a lista/i }).click()
  await expect(page).toHaveURL('/')
  await expect(
    page.getByText('Ticket VIP com sentimento negativo'),
  ).toBeVisible()
})

test('cria um workflow em branco, adiciona um node pela paleta e configura', async ({
  page,
}) => {
  await page.getByRole('button', { name: /^novo workflow$/i }).click()
  await expect(page).toHaveURL(/\/workflows\//)

  // Fallback acessível da paleta: clique em vez de drag and drop.
  await page.getByRole('button', { name: /^Gatilho/ }).click()

  // Adicionar pela paleta só cria o node — selecionar (para abrir o painel
  // de configuração) é uma interação separada, feita clicando nele no canvas.
  await page.getByText('Novo gatilho').click()

  const eventNameInput = page.getByLabel('Nome do evento')
  await expect(eventNameInput).toBeVisible()
  await eventNameInput.fill('ticket.created')

  await expect(page.getByRole('status')).toHaveText(/salvo/i)
})

test('abre a command palette com Ctrl+K e executa uma ação', async ({
  page,
}) => {
  await page.getByRole('combobox', { name: /começar com um exemplo/i }).click()
  await page
    .getByRole('option', { name: 'Ticket VIP com sentimento negativo' })
    .click()
  await expect(page).toHaveURL(/\/workflows\//)

  await page.keyboard.press('Control+k')
  const palette = page.getByRole('dialog')
  await expect(palette).toBeVisible()

  await page.getByText('Executar workflow').click()

  await expect(page.getByText('Histórico de execução')).toBeVisible()
})
