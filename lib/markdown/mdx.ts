import { compile } from '@mdx-js/mdx'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { rehypeTag } from '../rehype/rehype-tag'
import { rehypeExtractHeadings, rehypeHeadingsAddId } from '../rehype/rehype-toc'

// returns mdx function string
export async function compileMdxPost(src: string) {
  let headings: any[] = []

  const code = String(await compile(src, {
    outputFormat: 'function-body',
    remarkPlugins:[
      remarkGfm
    ],
    rehypePlugins: [
      rehypeHeadingsAddId,
      [rehypeExtractHeadings, { rank: [1, 2, 3], headings }],
      rehypeHighlight,
    ]
  }))

  // normalize heading rank
  if (headings.length > 0) {
    const minRank = Math.min(...headings.map(heading => heading.rank));
    const offset = minRank - 1;
    headings = headings.map(heading => ({
      ...heading,
      rank: heading.rank - offset
    }));
  }

  return { code, headings }
}

export async function compileMdxMemo(src: string) {

  const code = String(await compile(src, {
    outputFormat: 'function-body',
    remarkPlugins:[
      remarkGfm
    ],
    rehypePlugins: [
      rehypeHighlight,
      rehypeTag,
    ]
  }))

  return { code }
}