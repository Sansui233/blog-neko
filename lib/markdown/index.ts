import { Fragment, createElement, useEffect, useState } from 'react'
import * as prod from 'react/jsx-runtime'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import { unified } from 'unified'

// @ts-expect-error: the react types are missing.
const production = {Fragment: prod.Fragment, jsx: prod.jsx, jsxs: prod.jsxs}

export function useProcessor(text: string) {
  const [Content, setContent] = useState(createElement(Fragment))

  useEffect(
    function () {
      ;(async function () {
        const file = await unified()
          .use(rehypeParse, {fragment: true})
          .use(rehypeReact, production)
          .process(text)

        setContent(file.result) // here
      })()
    },
    [text]
  )

  return Content
}
