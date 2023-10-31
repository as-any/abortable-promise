# AbortablePromise

The `AbortablePromise` class is an extension of the native JavaScript `Promise`, designed to make it easier to abort promises. It adds an abort signal to the promise, which can trigger rejection of the promise when it's aborted.

## How to Use

Create [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) and pass its `signal` as a second argument of `AbortablePromise` constructor:

```typescript
const controller = new AbortController();
const signal = controller.signal;

const myPromise = new AbortablePromise((resolve, reject) => {
  // Do something
}, signal);
```

Or make your existing promise abortable:

```typescript
const originalPromise = new Promise((resolve, reject) => {
  // Do something
});
const myAbortablePromise = makeAbortable(originalPromise, signal);
```

Then call `abort()` method

```typescript
controller.abort();
```

Error handling can be done using the `catch`` method just like with regular promises:

```typescript
myAbortablePromise.catch(reason => {
  console.error('Promise was aborted:', reason);
});
```


By default, `AbortablePromise` rejects with an ["AbortError" DOMException](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort#parameters) if is aborted:

```typescript
setTimeout(() => controller.abort(), 1000);

try {
    await myAbortablePromise;
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log("Operation aborted: ", err.message);
    }
    console.log("Error occurred: ", err);
  }

```

Pass to `controller.abort()` any custom object you want to be promise rejected with:

```typescript
myAbortablePromise.catch(reason => {
    console.log(reason) // { myReason: 42 }
})

controller.abort({ myReason: 42 });

```
