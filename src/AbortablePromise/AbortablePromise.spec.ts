import { AbortablePromise } from './AbortablePromise'

describe('AbortablePromise', () => {
  it('should resolve correctly', async () => {
    const controller = new AbortController()
    const { signal } = controller
    const promise = new AbortablePromise<string>((resolve) => {
      setTimeout(() => { resolve('success') }, 100)
    }, signal)
    await expect(promise).resolves.toBe('success')
  })

  it('should reject on abort', async () => {
    const controller = new AbortController()
    const { signal } = controller
    const promise = new AbortablePromise<string>(() => {}, signal)
    controller.abort()
    await expect(promise).rejects.toThrowError()
  })
})
