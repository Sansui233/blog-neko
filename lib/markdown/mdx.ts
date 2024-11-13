import { compile, runSync } from '@mdx-js/mdx'
import React, { Fragment } from 'react'
import { renderToStaticMarkup } from "react-dom/server"
import * as prod from 'react/jsx-runtime'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { rehypeTag } from '../rehype/rehype-tag'
import { rehypeExtractHeadings, rehypeHeadingsAddId } from '../rehype/rehype-toc'
import { remarkTag } from '../remark/remark-tag'
import { remarkUnrwrapImages } from '../remark/remark-unwrap-images'

// returns mdx function string
export async function compileMdxPost(src: string) {
  let headings: { title: string; rank: number; id: string; }[] = []

  const code = String(await compile(src, {
    outputFormat: 'function-body',
    remarkPlugins: [
      remarkGfm,
      remarkUnrwrapImages
    ],
    rehypePlugins: [
      rehypeHeadingsAddId,
      [rehypeExtractHeadings, { rank: [1, 2, 3], headings }],
      rehypeHighlight,
    ]
  }))

  // normalize heading rank
  function normalizeHeading(headings: {
    title: string;
    rank: number;
    id: string;
  }[]) {
    if (headings.length > 0) {
      const minRank = Math.min(...headings.map(heading => heading.rank));
      const offset = minRank - 1;
      return headings.map(heading => ({
        ...heading,
        rank: heading.rank - offset
      }));
    } else {
      return headings
    }
  }
  return {
    code,
    headings: normalizeHeading(headings)
  }
}



export async function compileMdxMemo(src: string) {

  const code = String(await compile(src, {
    outputFormat: 'function-body',
    remarkPlugins: [
      remarkGfm,
      remarkTag,
    ],
    rehypePlugins: [
      rehypeHighlight,
    ]
  }))

  return { code }
}

/**
 * return html string
 */
export async function compileMdxRss(src: string, type: "md" | "mdx") {

  if (type === "md") {
    const code = String(await compile(src, {
      outputFormat: 'function-body',
      remarkPlugins: [
        remarkGfm
      ],
      rehypePlugins: [
        rehypeHighlight,
        rehypeTag,
      ]
    }))

    return renderToStaticMarkup(
      React.createElement(runSync(
        code,
        {
          Fragment: Fragment,
          ...prod,
          baseUrl: import.meta.url
        }
      ).default)
    )

  } else {
    return "This article is written in mdx format, which is not compatible with rss. Please visit the original site."
  }
}

