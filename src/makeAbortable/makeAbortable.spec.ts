import { makeAbortable } from './makeAbortable'

describe('makeAbortable', () => {
  it('should make a promise abortable', async () => {
    const controller = new AbortController()
    const { signal } = controller
    const promise = new Promise<string>((resolve) => {
      setTimeout(() => { resolve('success') }, 100)
    })
    const abortable = makeAbortable(promise, signal)
    await expect(abortable).resolves.toBe('success')
  })

  it('should reject an abortable promise on abort', async () => {
    const controller = new AbortController()
    const { signal } = controller
    const promise = new Promise<string>(() => {})
    const abortable = makeAbortable(promise, signal)
    controller.abort()
    await expect(abortable).rejects.toThrow('This operation was aborted')
  })

  it('should propagate non-abort errors', async () => {
    const controller = new AbortController()
    const { signal } = controller
    const errorMessage = 'Some other error'

    const failingPromise = new Promise<string>((_, reject) => { // eslint-disable-line promise/param-names
      setTimeout(() => { reject(new Error(errorMessage)) }, 100)
    })

    const abortable = makeAbortable(failingPromise, signal)

    await expect(abortable).rejects.toThrow(errorMessage)
  })

  describe('when involved in a Promise Chain', () => {
    it('should abort entire promise chain', async () => {
      const controller = new AbortController()
      const { signal } = controller

      const firstPromise = new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve('first')
        }, 100)
      })

      const secondPromise = (input: string): Promise<string> => new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(input + ' -> second')
        }, 100)
      })

      const abortableFirst = makeAbortable(firstPromise, signal)
      const abortableChain = abortableFirst.then(secondPromise)

      controller.abort()

      await expect(abortableChain).rejects.toThrow('This operation was aborted')
    })
  })

  describe('when involved in a Long Promise Chain', () => {
    let OriginalPromise = (global as any).Promise
    let promiseInstanceCounter = 0

    beforeEach(() => {
      OriginalPromise = (global as any).Promise
      promiseInstanceCounter = 0;

      (global as any).Promise = function (...args: any[]) {
        promiseInstanceCounter++
        return new OriginalPromise(...args)
      }
    })

    afterEach(() => {
      (global as any).Promise = OriginalPromise
      promiseInstanceCounter = 0
    })

    it('should abort entire promise chain of 100 after some time', async () => {
      const controller = new AbortController()
      const { signal } = controller

      let chain = new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve('start')
        }, 10)
      })

      const appendIndex = (input: string, index: number, signal: AbortSignal): Promise<string> => {
        return new Promise<string>((resolve) => {
          setTimeout(() => {
            resolve(`${input} -> ${index}`)
          }, 10)
        })
      }

      for (let i = 1; i <= 100; i++) {
        chain = chain.then((result) => appendIndex(result, i, signal))
      }

      chain = makeAbortable(chain, signal)

      chain.catch((error) => {
        expect(error.name).toBe('AbortError')
      })

      setTimeout(() => {
        controller.abort()
      }, 400)

      await expect(chain).rejects.toThrow('This operation was aborted')
      expect(promiseInstanceCounter).toBeLessThan(41)
    }, 1000)
  })
})
