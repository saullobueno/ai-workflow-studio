import { describe, expect, it } from 'vitest'
import { resolveTemplate } from './template'

describe('resolveTemplate', () => {
  it('substitui uma variável presente no contexto', () => {
    expect(resolveTemplate('Olá {{name}}', { name: 'Ana' })).toBe('Olá Ana')
  })

  it('substitui várias variáveis', () => {
    expect(resolveTemplate('{{a}} e {{b}}', { a: '1', b: '2' })).toBe('1 e 2')
  })

  it('converte valores não-string para string', () => {
    expect(resolveTemplate('total: {{count}}', { count: 3 })).toBe('total: 3')
  })

  it('mantém o placeholder quando a variável não existe no contexto', () => {
    expect(resolveTemplate('Olá {{missing}}', {})).toBe('Olá {{missing}}')
  })

  it('mantém o placeholder quando o valor é null ou undefined', () => {
    expect(resolveTemplate('{{a}}', { a: null })).toBe('{{a}}')
    expect(resolveTemplate('{{a}}', { a: undefined })).toBe('{{a}}')
  })

  it('não altera texto sem placeholders', () => {
    expect(resolveTemplate('texto simples', {})).toBe('texto simples')
  })
})
