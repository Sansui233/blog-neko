import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { rehypeTag } from '../rehype/rehype-tag'
import { rehypeExtractHeadings, rehypeHeadingsAddId } from '../rehype/rehype-toc'

export async function mdxPostProcessosr(mdxsrc: string) {

  // process content 
  let headings: any[] = []

  const compiledSrc = await serialize(mdxsrc, {
    mdxOptions: {
      remarkPlugins: [
        remarkGfm,
      ],
      rehypePlugins: [
        rehypeHeadingsAddId,
        [rehypeExtractHeadings, { rank: [1, 2, 3], headings }],
        // @ts-expect-error: the react types are missing.
        rehypeHighlight,
      ],
    }
  })

  // normalize heading rank
  if (headings.length > 0) {
    const minRank = Math.min(...headings.map(heading => heading.rank));
    const offset = minRank - 1;
    headings = headings.map(heading => ({
      ...heading,
      rank: heading.rank - offset
    }));
  }

  return { compiledSrc, headings }
}

export async function mdxMemoProcessosr(mdxsrc: string) {
  const compiledSrc = await serialize(mdxsrc, {
    mdxOptions: {
      // this function fails when it's called in useEffect in memo.tsx
      // see https://github.com/hashicorp/next-mdx-remote/issues/350
      development: process.env.NODE_ENV === 'development',
      remarkPlugins: [
        remarkGfm,
      ],
      rehypePlugins: [
        // @ts-expect-error: the react types are missing.
        rehypeHighlight,
        rehypeTag,
      ],
    }
  })

  return compiledSrc
}

/**
 * returns html string
 */
export async function mdxRssProcessor(mdxsrc: string, type: "md" | "mdx") {

  if (type === "md") {
    const compiledSrc = await serialize(mdxsrc, {
      mdxOptions: {
        development: process.env.NODE_ENV === 'development',
        format: "md",
        remarkPlugins: [
          remarkGfm,
        ],
        rehypePlugins: [
          // @ts-expect-error: the react types are missing.
          rehypeHighlight
        ],
      }
    })

    return renderToStaticMarkup(
      React.createElement(MDXRemote, {
        compiledSource: compiledSrc.compiledSource,
        scope: null,
        frontmatter: null
      })
    )

  }else {
    return "This articlei is written in mdx format, which is not compatible with rss. please visit the original site."
  }
}