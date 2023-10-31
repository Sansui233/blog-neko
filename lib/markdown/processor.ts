import { useEffect, useState } from 'react'
import * as prod from 'react/jsx-runtime'
import rehypeHighlight from 'rehype-highlight'
import rehypeReact from 'rehype-react'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { rehypeTag } from '../rehype/rehype-tag'
import { rehypeHeadingsAddId } from '../rehype/rehype-toc'

// @ts-expect-error: the react types are missing.
const production = {Fragment: prod.Fragment, jsx: prod.jsx, jsxs: prod.jsxs}
          
/**
 * post markdown to JSX
 */
export function usePostProcessor(mdText: string) {
  const [Content, setContent] = useState<JSX.Element>()

  useEffect(
    function () {
      ;(async function () {

        const processor  = unified()
          .use(remarkParse) // markdown -> a syntax tree
          .use(remarkGfm)
          .use(remarkRehype) // markdown syntax tree ->  HTML syntax tree, ignoring embedded HTML
          .use(rehypeHeadingsAddId)
          .use(rehypeHighlight)
          .use(rehypeReact, production) // rehype syntax tree ->  reactElemnt syntax tree?

        const file = await processor.process(mdText)
        console.log(file)
        setContent(file.result)
        
      })()
    },
    [mdText]
  )

  return Content
}

export function useMemoProcessor(mdText: string) {
  const [Content, setContent] = useState<JSX.Element>()

  useEffect(
    function () {
      ;(async function () {

        const processor  = unified()
          .use(remarkParse) // markdown -> a syntax tree
          .use(remarkGfm)
          .use(remarkRehype) // markdown syntax tree ->  HTML syntax tree, ignoring embedded HTML
          .use(rehypeTag)
          .use(rehypeHighlight)
          .use(rehypeReact, production) // rehype syntax tree ->  reactElemnt syntax tree?

        const file = await processor.process(mdText)
        setContent(file.result)
        
      })()
    },
    [mdText]
  )

  return Content
}