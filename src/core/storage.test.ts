import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import {
  listStorageKeys,
  readFromStorage,
  removeFromStorage,
  writeToStorage,
} from './storage'

const schema = z.object({ count: z.number() })

beforeEach(() => {
  window.localStorage.clear()
})

describe('storage', () => {
  it('faz round-trip de escrita e leitura validando pelo schema', () => {
    writeToStorage('counter', { count: 3 })
    expect(readFromStorage('counter', schema)).toEqual({ count: 3 })
  })

  it('retorna undefined quando a chave não existe', () => {
    expect(readFromStorage('missing', schema)).toBeUndefined()
  })

  it('retorna undefined quando o JSON salvo não bate com o schema', () => {
    window.localStorage.setItem(
      'ai-workflow-studio:counter',
      JSON.stringify({ count: 'not-a-number' }),
    )
    expect(readFromStorage('counter', schema)).toBeUndefined()
  })

  it('retorna undefined quando o conteúdo salvo não é JSON válido', () => {
    window.localStorage.setItem('ai-workflow-studio:counter', '{not json')
    expect(readFromStorage('counter', schema)).toBeUndefined()
  })

  it('remove uma chave', () => {
    writeToStorage('counter', { count: 1 })
    removeFromStorage('counter')
    expect(readFromStorage('counter', schema)).toBeUndefined()
  })

  it('prefixa as chaves para não colidir com outras aplicações no mesmo domínio', () => {
    writeToStorage('counter', { count: 1 })
    expect(
      window.localStorage.getItem('ai-workflow-studio:counter'),
    ).not.toBeNull()
    expect(listStorageKeys()).toContain('counter')
  })

  it('não lança quando localStorage.setItem falha (ex.: quota excedida)', () => {
    const setItemSpy = vi
      .spyOn(window.localStorage.__proto__, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('quota exceeded')
      })

    expect(() => writeToStorage('counter', { count: 1 })).not.toThrow()
    expect(writeToStorage('counter', { count: 1 })).toBe(false)

    setItemSpy.mockRestore()
  })
})
