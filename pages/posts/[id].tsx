import { readFileSync } from "fs"
import { GetStaticPaths, GetStaticProps } from "next"
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Head from "next/head"
import Link from "next/link"
import path from "path"
import remarkGfm from "remark-gfm"
import styled from "styled-components"
import { CommonHeader, MainLayoutStyle } from ".."
import Layout from "../../components/Layout"
import Pagination from "../../components/Pagination"
import Waline from "../../components/Waline"
import { dateToYMD } from "../../lib/date"
import { POST_DIR, getAllPostIds, getSortedPostsMeta } from "../../lib/posts"
import { bottomFadeIn } from "../../styles/animations"
import { MarkdownStyle } from "../../styles/markdown"

type Props = {
  mdxSource: MDXRemoteSerializeResult,
  excerpt: string,
  nextPost?: {
    title: string,
    link: string,
  } | null, // 由于 undefined 不能被序列化无奈加了 null
  prevPost?: {
    title: string,
    link: string,
  } | null
}

export default function Post({ mdxSource, nextPost, prevPost, excerpt }: Props) {
  const frontmatter = mdxSource.frontmatter! as any
  const source = mdxSource.compiledSource

  const description = frontmatter.description ?
    (frontmatter.description as string).concat(excerpt)
    : excerpt

  function genTags(tags: string | Array<string>) {
    const tagList = typeof (tags) === "string" ? [tags] : tags
    return <>
      {tagList.map((tag: string) => {
        return (
          <Link href={`/tags/${tag}`} passHref={true} key={tag} legacyBehavior>
            <StyledLinkGray>
              <IcoText className='icon-tag' />
              {`${tag} `}
            </StyledLinkGray>
          </Link>
        );
      })}
    </>;
  }

  // use tags and keywords in frontmatter as keywords in <meta>
  function getKeywords(fm: any) {
    const tagList = typeof (fm.tags) === "string" ? [fm.tags] : fm.tags
    if (fm.keywords !== null && typeof (fm.keywords) === "string") {
      return tagList.join().concat(', ').concat(fm.keywords.replaceAll('，',', '))
    } else {
      return tagList.join()
    }
  }

  return <>
    <Head>
      <title>{frontmatter.title}</title>
      <meta name="description" content={description}></meta>
      <meta name="keywords" content={getKeywords(frontmatter)}></meta>
      <CommonHeader />
    </Head>
    <Layout>
      <PostLayout>
        <PostTitle>
          <h1>{frontmatter.title}</h1>
          <MetaStyle>
            {frontmatter.date}
            {" | "}
            {genTags(frontmatter.tags)}
            {" in "}
            <Link
              href={`/categories/${frontmatter.categories}`}
              passHref={true}
              legacyBehavior>
              <StyledLinkGray>
              <IcoText className='icon-folder' />
                {frontmatter.categories}
              </StyledLinkGray>
            </Link>
          </MetaStyle>
        </PostTitle>
        <MarkdownStyle>
          <MDXRemote compiledSource={source} scope={null} frontmatter={null} />
        </MarkdownStyle>
        <div style={{ textAlign: 'right', opacity: .5, fontSize: '0.875rem', margin: "4rem 0 2rem 0" }}>
          更新于 {frontmatter.date}
        </div>
        <Pagination
          nextPage={nextPost ? nextPost : undefined}
          prevPage={prevPost ? prevPost : undefined}
        />
        <Waline />
      </PostLayout>
    </Layout>
  </>;
}


// ALL POSTS Dynamic Route 決定
export const getStaticPaths: GetStaticPaths = async () => {
  // return all [id]
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false
  }
}

// ONE POST Data
export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const id = params!.id as string
  const mdContent = readFileSync(path.join(POST_DIR, `${id}.md`), 'utf-8') // TODO 没有处理mdx的后缀

  // 获取摘要，分割YAML头和Markdown正文
  const yamlSeparator = '---\r\n';
  let sepIndex = mdContent.indexOf('---\n', 5)
  if (sepIndex === -1) {
    sepIndex = mdContent.indexOf('---\r\n', 5)
  }
  const mdBodyStart = mdContent.substring(sepIndex + yamlSeparator.length + 1); // Start at 5 to skip the first seperator
  const excerpt = mdBodyStart.replace(/\n/g, ' ').substring(0, 144);

  // Process Content
  const mdxSource = await serialize(
    mdContent,
    {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [],
        format: 'mdx',
      },
      parseFrontmatter: true
    })

  // Process Date
  const fm = mdxSource.frontmatter! as any
  if (fm["date"]) {
    fm["date"] = dateToYMD(fm["date"])
  }

  // Get next and prev Post
  const allPosts = getSortedPostsMeta()
  const i = allPosts.findIndex(p => p.id === id)
  const prevPost = i - 1 < 0 ? null : {
    title: allPosts[i - 1].title!,
    link: `/posts/${allPosts[i - 1].id!}`
  }
  const nextPost = i + 1 > allPosts.length - 1 ? null : {
    title: allPosts[i + 1].title!,
    link: `/posts/${allPosts[i + 1].id!}`
  }

  return {
    props: {
      mdxSource,
      prevPost: prevPost,
      nextPost: nextPost,
      excerpt
    }
  }
}

const PostLayout = styled(MainLayoutStyle)`
  max-width: 750px;
  margin-top: 72px;
  animation: ${bottomFadeIn} 1s ease;
`

const PostTitle = styled.div`
  margin-bottom: 3rem;
  h1 {
    margin-top: .3rem;
    margin-bottom: 0.5rem;
  }
`

const MetaStyle = styled.span`
  font-size: 0.875rem;
  position: relative;
  ::before {
    content:'';
    position: absolute;
    top: -.8em;
    left: 0;
    height: 1px;
    width: 100%;
    background: ${p => p.theme.colors.gold};
  }
  // border-top: 1px solid;
`
const IcoText = styled.i`
  padding-right: 0.2em;
`

const StyledLinkGray = styled.a`
color: ${p => p.theme.colors.textGray};
  transition: opacity .3s, color .3s;

  &:hover {
    color: ${p => p.theme.colors.gold};
  }
`
