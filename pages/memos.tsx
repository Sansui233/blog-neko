import { GetStaticProps } from "next";
import Head from "next/head";
import styled, { css } from "styled-components";
import { MarkdownStyle } from "../styles/markdown";
import { getMemoPosts } from "../utils/memos";
import React, { useState } from "react";
import { CommonHeader, MainLayoutStyle, PageDescription } from ".";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import Layout from "../components/Layout";

type MemoPost = {
  title: string,
  content: MDXRemoteSerializeResult
}

type Props = {
  memoposts: MemoPost[]
}

export default function Memos({ memoposts }: Props) {
  return (
    <div>
      <Head>
        <title>Sansui - Memos</title>
        <CommonHeader />
      </Head>
      <Layout>
        <MemoLayout>
          <MemoDescription>| 记录碎碎念是坏习惯 |</MemoDescription>
          {memoposts.map(m => (
            <MemoCard memoPost={m} key={m.title} />
          ))}
        </MemoLayout>
      </Layout>
    </div>
  )
}

function MemoCard({ memoPost }: { memoPost: MemoPost }) {
  const [isCollapse, setfisCollapse] = useState(true)
  const shouldCollapse = memoPost.content.compiledSource.length > 1100 ? true : false

  function handleExpand(e: React.MouseEvent<HTMLDivElement>) {
    setfisCollapse(!isCollapse)
  }

  return (
    <StyledCard isCollapse={isCollapse}>
      <h2 className="title">{memoPost.title}</h2>
      <MemoMarkdown bottomSpace={shouldCollapse}>
        <MDXRemote {...memoPost.content} />
      </MemoMarkdown>
      <CardMask onClick={handleExpand} isCollapse={isCollapse} isShown={shouldCollapse}>
        <div className="rd-more">
          <span>{isCollapse ? "SHOW MORE" : "Hide"}</span>
        </div>
      </CardMask>
    </StyledCard>
  )
}


/** Rendering Control **/

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = await getMemoPosts()
  const compiledPosts = await Promise.all(posts.map(async p => {

    const content = await serialize(p.content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm]
      }
    })

    return {
      title: p.title,
      content: content
    }

  }))


  return {
    props: { memoposts: compiledPosts }
  }
}

/** Styles **/

const MemoLayout = styled(MainLayoutStyle)`
  max-width: 720px;
`

const MemoDescription = styled(PageDescription)`
  margin-bottom: -2rem;
`

const StyledCard = styled.section<{
  isCollapse: boolean
}>`
  position: relative;
  max-height: ${props => props.isCollapse === true ? "18rem" : "unset"};
  overflow: hidden;
  margin: 2rem 0;
  h2.title {
    text-align: center;
    font-size: 1.5rem;
    margin-top: 2.5rem;
  }
`

const CardMask = styled.div<{
  isCollapse: boolean,
  isShown: boolean
}>`
    display: ${props => props.isShown === true ? "block" : "none"};
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 7rem;
    cursor: pointer;
    text-align: center;
    ${props => props.isCollapse === true ? props.theme.colors.memoGradient : ''}

    .rd-more {
      margin-top: 5.375rem;
      font-size: 0.875rem;
      padding: 0.2rem 0;
      span {
        box-shadow: inset 0 -0.3em 0 ${props => props.theme.colors.hoverBg};
        transition: box-shadow .3s;
      }
    }

    &:hover .rd-more span {
      box-shadow: inset 0 -1em 0 ${props => props.theme.colors.hoverBg};
    }
   
`

const MemoMarkdown = styled(MarkdownStyle) <{
  bottomSpace: boolean,
}>`
    padding-bottom: ${props => props.bottomSpace === true ? "2rem" : "inherit"};
    h1,h2,h3,h4,h5,h6 {
      font-size: 1rem;
    }
`