import { GetStaticPaths, GetStaticProps } from "next"
import styled from "styled-components"
import { getAllPostIds, POSTDIR } from "../../utils/posts"
import { MarkdownStyle } from "../../styles/markdown"
import { CommonHeader, MainLayoutStyle } from ".."
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { readFileSync } from "fs"
import path from "path"
import { dateToYMD } from "../../utils/date"
import Head from "next/head"
import Layout from "../../components/Layout"

type Props = {
  mdxSource: MDXRemoteSerializeResult
}

export default function Post({ mdxSource }: Props) {
  const frontmatter = mdxSource.frontmatter! as any
  const source = mdxSource.compiledSource

  function genTags(tags: any) {
    tags = typeof (tags) === "string" ? [tags] : tags
    return (
      <>
        {tags.map((tag: string) => {
          return <a href={`/tags/${tag}`} className="underline" key={tag}>{`#${tag}`}</a>
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
            {frontmatter.date}
            {" | "}
            {genTags(frontmatter.tags)}
            {" in "}
            <a href={`/categories/${frontmatter.categories}`} className="blockbg">{frontmatter.categories}</a>
          </PostTitle>
          <MarkdownStyle>
            <MDXRemote compiledSource={source} />
          </MarkdownStyle>
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
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params!.id as string
  const source = readFileSync(path.join(POSTDIR, `${id}.md`), 'utf-8')
  const mdxSource = await serialize(source, { parseFrontmatter: true })

  // Process Date
  const fm = mdxSource.frontmatter! as any
  if (fm["date"]) {
    fm["date"] = dateToYMD(fm["date"])
  }

  return { props: { mdxSource } }
}

const PostLayout = styled(MainLayoutStyle)`
  max-width: 800px;
  margin: 72px auto;
`

const PostTitle = styled.div`
  margin-bottom: 3rem;
  h1 {
    margin-top: .3rem;
    margin-bottom: 0.5rem;
  }

  a.underline {
    opacity: .8;
    border-bottom: solid 1px;

    &:hover {
      opacity: 1;
    }
  }

  a.blockbg {
    box-shadow: inset 0 -0.3rem 0 ${props => props.theme.colors.hoverBg};
    transition: box-shadow 0.5s ease;
  }
  a.blockbg:hover {
    box-shadow: inset 0 -1em 0 ${props => props.theme.colors.hoverBg};
  }
`

