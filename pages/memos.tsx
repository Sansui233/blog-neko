import { GetStaticProps } from "next";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import remarkGfm from "remark-gfm";
import styled, { ThemeContext } from "styled-components";
import { CommonHeader, PageDescription } from ".";
import Layout from "../components/Layout";
import { MarkdownStyle } from "../components/Markdown";
import Pagination from "../components/Pagination";
import Waline from "../components/Waline";
import { memo_db, writeMemoJson } from "../lib/data/memos";
import { INFOFILE, MemoInfo } from "../lib/data/memos.common";
import { siteInfo } from "../site.config";
import { bottomFadeIn } from '../styles/animations';
import { textShadow } from "../styles/styles";

const MemoCSRAPI = '/data/memos'

type MemoPost = {
  title: string,
  content: MDXRemoteSerializeResult,
  length: number,
}

type Props = {
  memoposts: MemoPost[]
}

export default function Memos({ memoposts }: Props) {
  const router = useRouter()
  const [postsData, setpostsData] = useState(memoposts)
  const [pagelimit, setpagelimit] = useState(1)

  useEffect(() => {
    fetch(`${MemoCSRAPI}/${INFOFILE}`)
      .then(res => res.json())
      .then((data) => {
        const p = (data as MemoInfo).pages
        setpagelimit(p + 1)
      })
  }, [])


  useEffect(() => {
    let page = 0
    if (typeof (router.query.p) === 'string') {
      page = parseInt(router.query.p)
      if (isNaN(page)) {
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
              remarkPlugins: [remarkGfm],
              development: process.env.NODE_ENV === 'development', // a bug in next-remote-mdx v4.4.1, see https://github.com/hashicorp/next-mdx-remote/issues/350.
            }
          })
          return {
            title: p.title,
            content: content,
            length: p.content.length,
          }
        }))
        return compiledPosts
      })
      .then(nextPosts => {
        setpostsData(nextPosts)
      }).catch(console.error);

  }, [router.query])

  const currPage = (() => {
    if (typeof (router.query.p) === 'string') {
      const page = parseInt(router.query.p)
      if (!isNaN(page)) {
        return page
      }
    }
    return 0
  })()

  return (
    <>
      <Head>
        <title>{siteInfo.author} - Memos</title>
        <CommonHeader />
      </Head>
      <Layout>
        <MemoLayout>
          <div>
            <MemoDescription>| 记录碎碎念是坏习惯 |</MemoDescription>
            {postsData.map(m => (
              <MemoCard key={m.title} memoPost={m} />
            ))}
            <Pagination

              currTitle={`PAGE ${currPage + 1}`}
              prevPage={currPage > 0 ? {
                title: "PREV",
                link: `/memos?p=${currPage - 1}`
              } : undefined}
              nextPage={currPage + 1 < pagelimit ? {
                title: "NEXT",
                link: `/memos?p=${currPage + 1}`
              } : undefined}
              maxPage={pagelimit.toString()}
            />
            <Waline />
          </div>
        </MemoLayout>
      </Layout>
    </>
  )
}

function MemoCard({ memoPost }: { memoPost: MemoPost }) {
  const [isCollapse, setfisCollapse] = useState(true)
  const theme = useContext(ThemeContext)
  const ref = React.useRef<HTMLDivElement>(null)

  const shouldCollapse = memoPost.length > 200 ? true : false

  function handleExpand(e: React.MouseEvent<HTMLDivElement>) {
    // Scroll back
    if (!isCollapse) {
      const element = ref.current;
      if (element) {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < 0 || elementTop > window.innerHeight) {
          window.scrollTo({
            top: elementTop + window.scrollY,
            behavior: "smooth",
          });
        }
      }
    }
    setfisCollapse(!isCollapse)
  }

  return (
    <StyledCard $isCollapse={shouldCollapse === false ? false : isCollapse} ref={ref}>
      <div className="content">
        <CardMeta>
          {/*eslint-disable-next-line @next/next/no-img-element*/}
          <img src={theme!.assets.favico} alt={siteInfo.author} />
          <div>
            <div>{siteInfo.author}</div>
            <div className="date">
              {memoPost.title}&nbsp;&nbsp;
              <span className="word-count">{memoPost.length}&nbsp;字</span>
            </div>
          </div>
        </CardMeta>
        <MemoMarkdown $bottomSpace={shouldCollapse}>
          <MDXRemote compiledSource={memoPost.content.compiledSource} scope={null} frontmatter={null} />
        </MemoMarkdown>
        <CardMask $isCollapse={isCollapse} $isShown={shouldCollapse}>
          <div onClick={handleExpand} className="rd-more">
            <span>{isCollapse ? "SHOW MORE" : "Hide"}</span>
          </div>
        </CardMask>
      </div>

    </StyledCard>
  )
}


/** Rendering Control **/

export const getStaticProps: GetStaticProps<Props> = async () => {
  // 生成 CSR 所需 JSON，SSR 需独立出逻辑
  writeMemoJson()

  // 首屏 SEO 数据
  const posts = await memo_db.atPage(0)
  const compiledPosts = await Promise.all(posts.map(async p => {
    const content = await serialize(p.content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm]
      }
    })
    return {
      title: p.title,
      content: content,
      length: p.content.length,
    }
  }))


  return {
    props: {
      memoposts: compiledPosts
    }
  }
}

/** Styles **/
const MemoLayout = styled.div`
  background: ${p => p.theme.colors.bg2};
  padding: 2rem 0;

  & > div {
    max-width: 780px;
    margin: 0 auto;
    padding: 0px 16px 48px 16px;
  
    @media screen and (max-width: 780px) {
      max-width: 100%;
    }
  
    @media screen and (max-width: 580px) {
      padding: 0 0 48px 0;
    }
  }
`

const MemoDescription = styled(PageDescription)`
`

const StyledCard = styled.section<{
  $isCollapse: boolean
}>`
  background: ${p => p.theme.colors.bg};
  margin: 1rem 0;
  padding: 1.25rem 1.5rem;
  box-shadow: rgb(0 0 0 / 10%) 0px 2px 4px;
  animation: ${bottomFadeIn} 1s ease;

  @media screen and (max-width: 780px) {
    padding: 1.25rem 1.5rem;
  }

  @media screen and (max-width: 580px) {
    padding: 1.25rem 1rem;
  }
  
  & > .content {
    position: relative;
    height: ${props => props.$isCollapse === true ? "19rem" : "auto"};
    overflow: hidden;
    /* transition: height 0.5s ease; */
  }
`

const CardMeta = styled.div`
    display: flex;

    & > img {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      border: 1px solid ${p => p.theme.colors.uiLineGray};
    }

    & > div{
      margin-left: 0.5rem;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    & .date {
      font-size: 0.9rem;
      font-family: Dosis;
      color: ${p => p.theme.colors.textGray};
    }

    & .word-count {
      position: absolute;
      right: 0;
    }
`

const MemoMarkdown = styled(MarkdownStyle) <{
  $bottomSpace: boolean,
}>`
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-bottom: ${props => props.$bottomSpace === true ? "2rem" : "inherit"};
    h1,h2,h3,h4,h5,h6 {
      font-size: 1rem;
    }
`


const CardMask = styled.div<{
  $isCollapse: boolean,
  $isShown: boolean
}>`
    display: ${props => props.$isShown === true ? "block" : "none"};
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 7rem;
    text-align: right;
    color: ${p => p.theme.colors.gold};
    ${props => props.$isCollapse === true ? props.theme.colors.maskGradient : ''}

    .rd-more {
      margin-top: 5.375rem;
      font-size: 0.875rem;
      padding: 0.2rem 0;
      cursor: pointer;
      span {
        transition: box-shadow .3s;
      }
    }

    & .rd-more:hover span {
      ${() => textShadow.f}
    }
   
`