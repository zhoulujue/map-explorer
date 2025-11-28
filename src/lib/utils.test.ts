import { describe, it, expect, vi } from 'vitest'
import { debounce } from './utils'

describe('debounce', () => {
  it('delays execution and coalesces multiple calls', async () => {
    const spy = vi.fn()
    const d = debounce(spy, 50)
    d()
    d()
    d()
    await new Promise((r) => setTimeout(r, 80))
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('passes arguments to original function', async () => {
    const spy = vi.fn()
    const d = debounce(spy, 20)
    d('a', 1)
    await new Promise((r) => setTimeout(r, 30))
    expect(spy).toHaveBeenCalledWith('a', 1)
  })
})
