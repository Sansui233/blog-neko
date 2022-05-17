import { GetStaticPaths, GetStaticProps } from "next"
import styled from "styled-components"
import { getAllPostIds, POSTDIR } from "../../utils/posts"
import { MarkdownStyle } from "../../styles/markdown"
import { CommonHeader, MainContent } from ".."
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
    if (tags instanceof Array) {
      return (tags.map(tag => {
        return `#${tag} `
      }))
    } else {
      return `#${tags}`
    }
  }

  return (
    <div>
      <Head>
        <title>{frontmatter.title}</title>
        <CommonHeader />
      </Head>
      <Layout>
        <PostLayout>
          <PostTitle>
            <h1>{frontmatter.title}</h1>
            {frontmatter.date} | {genTags(frontmatter.tags)} in {frontmatter.categories}
          </PostTitle>
          <MarkdownStyle>
            <MDXRemote compiledSource={source} />
          </MarkdownStyle>
        </PostLayout>
      </Layout>
    </div>
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

const PostLayout = styled(MainContent)`
  max-width: 800px;
  margin: 72px auto;
`

const PostTitle = styled.div`
  margin-bottom: 3rem;
  h1 {
    margin-top: .3rem;
    margin-bottom: 0.5rem;
  }
`

