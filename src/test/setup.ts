import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom não implementa ResizeObserver, mas o @xyflow/react (canvas do
// editor) instancia um via `new ResizeObserver(...)` para medir os nodes.
// Sem esse mock, qualquer teste que renderize o canvas falha com
// "ResizeObserver is not defined" (ou "not a constructor" se for uma
// arrow function em vez de uma classe/function real).
/* eslint-disable @typescript-eslint/no-empty-function -- mock de teste, sem comportamento a simular */
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
/* eslint-enable @typescript-eslint/no-empty-function */

globalThis.ResizeObserver = ResizeObserverMock

// jsdom também não implementa scrollIntoView, usado pelo cmdk (command
// palette) para rolar até o item destacado.
Element.prototype.scrollIntoView = vi.fn()

// jsdom também não implementa a API de Pointer Capture, usada pelo Radix
// Select (e outros primitivos baseados em ponteiro) para abrir/fechar.
Element.prototype.hasPointerCapture = vi.fn(() => false)
Element.prototype.setPointerCapture = vi.fn()
Element.prototype.releasePointerCapture = vi.fn()
