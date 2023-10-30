type Executor<T> = (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void

export class AbortablePromise<T> extends Promise<T> {
  constructor (executor: Executor<T>, signal: AbortSignal) {
    super((resolve, reject) => {
      executor(resolve, reject)
      signal?.addEventListener('abort', () => {
        reject(signal.reason)
      }, { once: true })
    })
  }
}
