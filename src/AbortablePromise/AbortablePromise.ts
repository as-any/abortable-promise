type Executor<T> = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void

export class AbortablePromise<T> extends Promise<T> {
  constructor (executor: Executor<T>, signal: AbortSignal) {
    super((resolve, reject) => {
      if (signal?.aborted) {
        reject(signal.reason)
        return
      }

      executor(resolve, reject)

      signal?.addEventListener('abort', () => {
        reject(signal.reason)
      }, { once: true })
    })
  }
}
