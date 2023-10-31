import { Fragment, createElement, useEffect, useState } from 'react'
import * as prod from 'react/jsx-runtime'
import rehypeReact from 'rehype-react'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

// @ts-expect-error: the react types are missing.
const production = {Fragment: prod.Fragment, jsx: prod.jsx, jsxs: prod.jsxs}

/**
 * md to JSX
 */
export function useProcessor(mdText: string) {
  const [Content, setContent] = useState(createElement(Fragment))

  useEffect(
    function () {
      ;(async function () {

        const processor  = unified()
          .use(remarkParse) // markdown -> a syntax tree
          .use(remarkRehype) // markdown syntax tree ->  HTML syntax tree, ignoring embedded HTML 
          .use(rehypeReact, production) // rehype syntax tree ->  reactElemnt syntax tree?

        const file = await processor.process(mdText)
        setContent(file.result)
        
      })()
    },
    [mdText]
  )

  return Content
}

