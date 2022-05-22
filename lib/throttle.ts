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