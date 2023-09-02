export function throttle(fn: Function, delay: number) {
  let timer: NodeJS.Timeout | null = null;
  return function (this: any) {
    if (!timer) {
      fn.apply(this, arguments)
      timer = setTimeout(
        () => {
          clearTimeout(timer!)
          timer = null
        },
        delay)
    }
  }
}

// https://stackoverflow.com/questions/72205837/safe-type-debounce-function-in-typescript
export function debounce<T extends (...args: any[]) => void>(
  callback: T,
  wait: number,
  immediate = false,
)  {
  // This is a number in the browser and an object in Node.js,
  // so we'll use the ReturnType utility to cover both cases.
  let timeout: ReturnType<typeof setTimeout> | null;

  return function <U>(this: U, ...args: Parameters<typeof callback>) {
    const context = this;
    const later = () => {
      timeout = null;

      if (!immediate) {
        callback.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;

    if (typeof timeout === "number") {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) {
      callback.apply(context, args);
    }
  };
}