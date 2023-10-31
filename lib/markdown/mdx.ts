import { serialize } from 'next-mdx-remote/serialize'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { rehypeTag } from '../rehype/rehype-tag'
import { rehypeExtractHeadings, rehypeHeadingsAddId } from '../rehype/rehype-toc'

export async function mdxPostProcessosr(mdxsrc: string) {
  // Process Content 
  let headings: any[] = [] // TODO heaing extract on ssr


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
      development: process.env.NODE_ENV === 'development', // 需指定为 react server component
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