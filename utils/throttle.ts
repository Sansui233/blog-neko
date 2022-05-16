// TODO move to utils
export function throttle(fn: Function, delay: number) {
  let timer: NodeJS.Timeout | null = null;
  let num = (new Date()).getMilliseconds()
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