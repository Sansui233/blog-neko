import { runSync } from '@mdx-js/mdx'
import { MDXProvider } from '@mdx-js/react'
import { Fragment } from 'react'
// import * as dev from 'react/jsx-dev-runtime'
import * as prod from 'react/jsx-runtime'
import { MDImg } from './Markdown'

/**
 * @param code function string
 * see https://mdxjs.com/packages/mdx/#runoptions
 * see https://mdxjs.com/packages/mdx/#runcode-options
 */
function convertBack(code: string) {
  const runOptions = {
    Fragment: Fragment,
    ...prod,
    baseUrl: import.meta.url
  }

  const mdxModule = runSync(code, runOptions) // support ssg, but there is an impact on fcp when ISR/SSR
  return mdxModule
}

export function useMdxPost(code: string) {
  const mdxModule = convertBack(code)
  return <MDXProvider components={{ img: MDImg }}>
    <mdxModule.default />
  </MDXProvider>
}

export function useMdxMemo(code: string) {
  const mdxModule = convertBack(code)
  return <mdxModule.default />
}

// white on first load. not friendly to seo
// function useCsr(mdxModule: Promise<MDXModule>) {
//   const [module, setmodule] = useState<MDXModule | undefined>()
//   useEffect(() => {
//     ; (async function () {
//       setmodule(await mdxModule)
//     })()
//   }, [mdxModule])

//   return module ? <module.default /> : Fragment

// }