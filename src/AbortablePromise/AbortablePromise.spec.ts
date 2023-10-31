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

  it('should reject immediately if AbortSignal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()

    const myPromise = new AbortablePromise(
      (resolve, reject) => {
        fail('The executor should not be invoked')
      },
      controller.signal
    )

    try {
      await expect(myPromise).rejects.toThrow()
    } catch (err: any) {
      expect(err.name).toBe('AbortError')
    }
  })

  it('should reject with custom reason when aborted', async () => {
    const controller = new AbortController()
    const customReason = { myReason: 'Custom reason' }

    const myPromise = new AbortablePromise(
      (resolve, reject) => {
        // Do nothing
      },
      controller.signal
    )

    setTimeout(() => { controller.abort(customReason) }, 40)

    await expect(myPromise).rejects.toEqual(customReason)
  })
})
