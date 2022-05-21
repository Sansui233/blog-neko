import { GetStaticPaths, GetStaticProps } from "next"
import styled from "styled-components"
import { getAllPostIds, getSortedPostsMeta, POSTDIR } from "../../utils/posts"
import { MarkdownStyle } from "../../styles/markdown"
import { CommonHeader, MainLayoutStyle } from ".."
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { readFileSync } from "fs"
import path from "path"
import { dateToYMD } from "../../utils/date"
import Head from "next/head"
import Layout from "../../components/Layout"
import Link from "next/link"
import { textBoxShadow } from "../../styles/styles"
import Pagination from "../../components/Pagination"

type Props = {
  mdxSource: MDXRemoteSerializeResult,
  nextPost?: {
    title: string,
    link: string,
  } | null, // 由于 undefined 不能被序列化无奈加了 null
  prevPost?: {
    title: string,
    link: string,
  } | null
}

export default function Post({ mdxSource, nextPost, prevPost }: Props) {
  const frontmatter = mdxSource.frontmatter! as any
  const source = mdxSource.compiledSource

  function genTags(tags: any) {
    tags = typeof (tags) === "string" ? [tags] : tags
    return (
      <>
        {tags.map((tag: string) => {
          return <Link href={`/tags/${tag}`} passHref={true} key={tag}>
            <StyledLinkGray>{`#${tag} `}</StyledLinkGray>
          </Link>
        })}
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{frontmatter.title}</title>
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
              <Link href={`/categories/${frontmatter.categories}`} passHref={true}>
                <StyledLinkBgblock>{frontmatter.categories}</StyledLinkBgblock>
              </Link>
            </MetaStyle>
          </PostTitle>
          <MarkdownStyle>
            <MDXRemote compiledSource={source} />
          </MarkdownStyle>
          <div style={{ textAlign: 'right', opacity: .5, fontSize: '0.875rem', margin: "4rem 0 2rem 0" }}>
            更新于 {frontmatter.date}
          </div>
          <Pagination
            nextPage={nextPost ? nextPost : undefined}
            prevPage={prevPost ? prevPost : undefined}
          />
        </PostLayout>
      </Layout>
    </>
  )
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
  const source = readFileSync(path.join(POSTDIR, `${id}.md`), 'utf-8')
  const mdxSource = await serialize(source, { parseFrontmatter: true })

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
    }
  }
}

const PostLayout = styled(MainLayoutStyle)`
  max-width: 750px;
  margin-top: 72px;
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
    width: 133%;
    background: ${p => p.theme.colors.gold};
  }
  // border-top: 1px solid;
`

const StyledLinkGray = styled.a`
color: ${p => p.theme.colors.textGray};
  transition: opacity .3s, color .3s;

  &:hover {
    color: ${p => p.theme.colors.gold};
  }
`

const StyledLinkBgblock = styled.a`
  ${() => textBoxShadow.s}
  transition: box-shadow 0.5s ease;

  :hover {
    ${() => textBoxShadow.f}
  }

`

