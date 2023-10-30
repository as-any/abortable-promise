import { AbortablePromise } from '../AbortablePromise'

export function makeAbortable<T> (promise: Promise<T>, signal: AbortSignal): AbortablePromise<T> {
  return new AbortablePromise<T>((resolve, reject) => {
    promise.then(resolve).catch(reject)
  }, signal)
}
