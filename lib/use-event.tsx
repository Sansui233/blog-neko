import { useEffect } from "react"



/**
 * do some key bindings  
 * be aware of extra dependencies. You xan check your listener by use memo.  
 * or just use a memorized callback
 * see https://www.reddit.com/r/reactjs/comments/dgbn15/comment/f3az9nh/?utm_source=share&utm_medium=web2x&context=3
 */
export function useDocumentEvent<K extends keyof DocumentEventMap>(
  command: K,
  listener: (this: Document, ev: DocumentEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
  deps?: unknown[]
) {
  useEffect(() => {
    document.addEventListener(command, listener, options)
    return () => {
      document.removeEventListener(command, listener, options)
    }
    // there is an issue about deps in custom hook, I don't like ot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command, listener, options, ...(deps || [])])
}