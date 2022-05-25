import { GetStaticProps } from "next";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import remarkGfm from "remark-gfm";
import styled from "styled-components";
import { CommonHeader, MainLayoutStyle, PageDescription } from ".";
import Layout from "../components/Layout";
import Pagination from "../components/Pagination";
import Waline from "../components/Waline";
import { genMemoJsonFile, getMemoPages, getMemoPosts } from "../lib/memos";
import { bottomFadeIn } from '../styles/animations';
import { MarkdownStyle } from "../styles/markdown";
import { textBoxShadow } from "../styles/styles";

const MemoCSRAPI = '/data/memos'

type MemoPost = {
  title: string,
  content: MDXRemoteSerializeResult
}

type Props = {
  memoposts: MemoPost[]
  pagelimit: number
}

export default function Memos({ memoposts, pagelimit }: Props) {
  const router = useRouter()
  const [postsData, setpostsData] = useState(memoposts)

  useEffect(() => {
    let page = 0
    if (typeof (router.query.p) === 'string') {
      page = parseInt(router.query.p)
      if (page === NaN) {
        console.error('Wrong query p=', router.query.p)
        return
      }
    }
    fetch(`${MemoCSRAPI}/${page}.json`)
      .then(res => res.json())
      .then((data) => {
        const posts = data as Array<{ title: string, content: string }>
        const compiledPosts = Promise.all(posts.map(async p => {
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
        return compiledPosts
      })
      .then(posts => {
        setpostsData(posts)
      }).catch(console.error);
  }, [router.query])
  const currPage = (() => {
    if (typeof (router.query.p) === 'string') {
      const page = parseInt(router.query.p)
      if (page !== NaN) {
        return page
      }
    }
    return 0
  })()

  return (
    <>
      <Head>
        <title>Sansui - Memos</title>
        <CommonHeader />
      </Head>
      <Layout>
        <MemoLayout>
          <MemoDescription style={{ marginBottom: '-2rem' }}>| 记录碎碎念是坏习惯 |</MemoDescription>
          {postsData.map(m => (
            <MemoCard key={m.title} memoPost={m} />
          ))}
          <Pagination
            currTitle={`PAGE ${currPage + 1}`}
            prevPage={currPage > 0 ? {
              title: "PREV",
              link: `/memos?p=${currPage - 1}`
            } : undefined
            }
            nextPage={currPage + 1 < pagelimit ? {
              title: "NEXT",
              link: `/memos?p=${currPage + 1}`
            } : undefined
            }
          />
          <Waline />
        </MemoLayout>
      </Layout>
    </>
  )
}

function MemoCard({ memoPost }: { memoPost: MemoPost }) {
  const [isCollapse, setfisCollapse] = useState(true)
  const shouldCollapse = memoPost.content.compiledSource.length > 1014 ? true : false

  function handleExpand(e: React.MouseEvent<HTMLDivElement>) {
    setfisCollapse(!isCollapse)
  }

  return (
    <StyledCard isCollapse={shouldCollapse === false ? false : isCollapse}>
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
  // 首屏 SEO 数据
  const posts = await getMemoPosts(0)
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

  // 生成 CSR 所需 JSON
  genMemoJsonFile()

  return {
    props: {
      memoposts: compiledPosts,
      pagelimit: await getMemoPages()
    }
  }
}

/** Styles **/
const MemoLayout = styled(MainLayoutStyle)`
  max-width: 720px;
`

const MemoDescription = styled(PageDescription)`
  
`

const StyledCard = styled.section<{
  isCollapse: boolean
}>`
  position: relative;
  max-height: ${props => props.isCollapse === true ? "19rem" : "unset"};
  overflow: hidden;
  margin: 2rem 0;
  animation: ${bottomFadeIn} 1s ease;
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
        ${() => textBoxShadow.s}
        transition: box-shadow .3s;
      }
    }

    &:hover .rd-more span {
      ${() => textBoxShadow.f}
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