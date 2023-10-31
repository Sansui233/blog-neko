import { GetStaticProps } from "next";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import remarkGfm from "remark-gfm";
import styled, { ThemeContext } from "styled-components";
import { CommonHead } from ".";
import Footer from "../components/Footer";
import { TwoColLayout } from "../components/Layout";
import { MarkdownStyle } from "../components/Markdown";
import Pagination from "../components/Pagination";
import Topbar from "../components/Topbar";
import Waline from "../components/Waline";
import { memo_db, writeMemoJson } from "../lib/data/memos";
import { MemoInfo, MemoPost as MemoPostRemote, MemoTagArr } from "../lib/data/memos.common";
import { rehypeTag } from "../lib/rehype/rehype-tag";
import { Naive, Result, SearchObj } from "../lib/search";
import { siteInfo } from "../site.config";
import { bottomFadeIn } from '../styles/animations';
import { paperCard, textShadow } from "../styles/styles";

const MemoCSRAPI = '/data/memos'

type MemoPost = Omit<MemoPostRemote, 'content'> & {
  content: MDXRemoteSerializeResult
  length: number;
}

type Props = {
  memos: MemoPost[] // 首屏 seo data
  info: MemoInfo,
  memotags: MemoTagArr, // tagname, memo list

}

type SearchStatus = {
  pagelimit: number,
}

export default function Memos({ memos, info, memotags }: Props) {
  const [engine, setEngine] = useState<Naive>()
  const router = useRouter()
  const [postsData, setpostsData] = useState(memos)
  const theme = useContext(ThemeContext)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchStatus, setsearchStatus] = useState<SearchStatus>({ pagelimit: 5 })

  // fetch csr content by page number
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
        const posts = data as Array<MemoPostRemote>
        const compiledMemos = compile(posts)
        return compiledMemos
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


  function handleSearch() {
    if (!inputRef.current) return

    const str = inputRef.current.value.trim()

    if (str.length === 0) return

    if (!engine) {
      // Init Search Engine && Get data
      initSearch(setEngine, setpostsData, setsearchStatus, info.pages)
      console.log("初始化搜索中，请稍后重试...")
    } else {
      engine.search(str.split(" "))
    }
  }


  return (
    <>
      <Head>
        <title>{`${siteInfo.author} - Memos`}</title>
        <CommonHead />
      </Head>
      <Topbar
        placeHolder={false}
        scrollElem={scrollRef.current ? scrollRef.current : undefined}
        hideSearch={true}
        style={{ background: theme?.colors.bg2 }}
      />
      <main style={{ backgroundColor: theme?.colors.bg2, overflow: "hidden", height: "100vh" }}>
        <OneColLayout>
          <TwoColLayout
            sep={1}
            siderLocation="right"
          >
            <MemoCol ref={scrollRef}>
              <div style={{ minHeight: "100vh" }}>
                {postsData.map(m => (
                  <MemoCard key={m.id} memoPost={m} scrollref={scrollRef} />
                ))}
              </div>
              <Pagination
                currTitle={`PAGE ${currPage + 1}`}
                prevPage={currPage > 0 ? {
                  title: "PREV",
                  link: `/memos?p=${currPage - 1}`
                } : undefined}
                nextPage={currPage + 1 < info.pages ? {
                  title: "NEXT",
                  link: `/memos?p=${currPage + 1}`
                } : undefined}
                maxPage={info.pages.toString()}
                elemProps={{ style: { padding: "0 1rem" } }}
              />
              <Waline style={{ padding: "0 0.5rem" }} />
              <Footer />
            </MemoCol>
            <SiderCol>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <SearchBox type="text" placeholder="Search" ref={inputRef}
                  onFocus={
                    () => { initSearch(setEngine, setpostsData, setsearchStatus, info.pages) }
                  }
                />
                <CardTitleIcon className="hover-gold" style={{ fontSize: "1.275em", marginLeft: "0.125em" }}
                  onClick={handleSearch}>
                  <i className='icon-search' />
                </CardTitleIcon>
              </div>
              <NavCard>
                <div className="item active">
                  <span className="title">Memos</span>
                  <span className="count">{info.count.memos}</span>
                </div>
                <div className="item">
                  <span className="title">Photos</span>
                  <span className="count">{info.count.imgs}</span>
                </div>
              </NavCard>
              <TagCard>
                <CardTitle>TAGS</CardTitle>
                <div style={{ paddingTop: "0.5rem" }}>
                  {memotags.map(t => {
                    return <span className="hover-gold" key={t[0]}>
                      {`#${t[0]}`}
                    </span>
                  })}
                </div>
              </TagCard>
            </SiderCol>
          </TwoColLayout>
          <Footer />
        </OneColLayout>
      </main>
    </>
  )
}

function MemoCard({ memoPost, scrollref }: {
  memoPost: MemoPost,
  scrollref: React.RefObject<HTMLDivElement>
}) {
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
          scrollref.current?.scrollTo({
            top: elementTop + window.scrollY,
            behavior: "smooth",
          });
        }
      }
    }
    setfisCollapse(!isCollapse)
  }

  return (
    <MemoCardStyle $isCollapse={shouldCollapse === false ? false : isCollapse} ref={ref}>
      <div className="content">
        <MemoMeta>
          {/*eslint-disable-next-line @next/next/no-img-element*/}
          <img src={theme!.assets.favico} alt={siteInfo.author} />
          <div>
            <div>{siteInfo.author}</div>
            <div className="date">
              {memoPost.id}&nbsp;&nbsp;
              <span className="word-count">{memoPost.length}&nbsp;字</span>
            </div>
          </div>
        </MemoMeta>
        <MemoMarkdown $bottomSpace={shouldCollapse}>
          <MDXRemote compiledSource={memoPost.content.compiledSource} scope={null} frontmatter={null} />
        </MemoMarkdown>
        <CardMask $isCollapse={isCollapse} $isShown={shouldCollapse}>
          <div onClick={handleExpand} className="rd-more">
            <span>{isCollapse ? "SHOW MORE" : "Hide"}</span>
          </div>
        </CardMask>
      </div>

    </MemoCardStyle>
  )
}


/** Rendering Control **/

export const getStaticProps: GetStaticProps<Props> = async () => {
  // 生成 CSR 所需 JSON，SSR 需独立出逻辑
  writeMemoJson()

  return {
    props: {
      memos: await compile(memo_db.atPage(0)), // 首屏 SEO 数据
      info: memo_db.info,
      memotags: Array.from(memo_db.tags),
    }
  }
}

async function compile(posts: MemoPostRemote[]): Promise<MemoPost[]> {
  return Promise.all(posts.map(async m => {
    const content = await serialize(m.content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeTag],
        development: process.env.NODE_ENV === 'development', // a bug in next-remote-mdx v4.4.1, see https://github.com/hashicorp/next-mdx-remote/issues/350.
      }
    })
    return {
      ...m,
      content: content,
      length: m.content.length,
    }
  }))
}

function initSearch(
  setEngine: React.Dispatch<React.SetStateAction<Naive | undefined>>,
  setResultFn: React.Dispatch<React.SetStateAction<MemoPost[]>>,
  setStatus: React.Dispatch<React.SetStateAction<SearchStatus>>,
  maxPage: number, // max csrpage
  pagelimit = 5, // new range limit
) {

  console.log("%% init search...")
  pagelimit = maxPage < pagelimit ? maxPage : pagelimit;

  // Fetch data and set search engine
  const urls = Array.from({ length: pagelimit + 1 }, (_, i) => `${MemoCSRAPI}/${i}.json`)
  const requests = urls.map(url => fetch(url).then(res => res.json()));
  Promise.all(requests).then(reqres => {

    const src = (reqres as MemoPostRemote[][]).flatMap(v => v)

    const searchObj: SearchObj[] = src.map(memo => {
      return {
        id: memo.id,
        title: "", // 无效化 title。engine 动态构建结果写起来太麻烦了，以后再说。
        content: memo.content,
        tags: memo.tags,
      }
    })


    // 过滤结果
    // 这个函数也会持久化下载数据
    function notifier(searchres: Required<Result>[]) {
      const ids = searchres.map(r => r.id)
      const filtered = src.filter(memo => {
        if (ids.includes(memo.id)) {
          return true
        }
        return false
      })
      compile(filtered).then(compiled => {
        setResultFn(compiled)
      })
    }

    setEngine(new Naive({
      data: searchObj,                    // search in these data
      field: ["tags", "content"],         // properties to be searched in data
      notifier,                            // 通常是 useState 的 set 函数
      disableStreamNotify: true,
    }))

    setStatus({ pagelimit })

  }).catch(error => {
    console.error("[memos.ts] An error occurred when fetching index:", error);
  });
}


const OneColLayout = styled.div`
  max-width: 1080px;
  margin: 0 auto;

  @media screen and (max-width: 780px) {
    max-width: 100%;
  }

  @media screen and (max-width: 580px) {
  }
`

/** Styles **/
const MemoCol = styled.div`
  margin-bottom: 2rem;
  max-width: 780px;
  padding: 86px 16px 48px 16px;
  align-self: flex-end;
  overflow-y: auto;
  height: 100vh;

  &::-webkit-scrollbar {
    display: none;
  }


  @media screen and (max-width: 780px) {
    max-width: 100%;
  }

  @media screen and (max-width: 580px) {
    padding: 63px 0 48px 0;
  }

`

const SiderCol = styled.div`
  max-width: 21em;
  padding-top: 100px;
  margin: 0 0.5rem;
  
  @media screen and (max-width: 1080px) {
    margin: 0;
  }

  @media screen and (max-width: 780px) {
    max-width: unset;
    display: none;
  }

  /* util class */
  .hover-gold {
    padding: 3px 5px;
    borde-radius: 50%;
    cursor: pointer;
  }

  .hover-gold:hover {
    color: ${p => p.theme.colors.gold};
  }
`

const MemoCardStyle = styled.section<{
  $isCollapse: boolean
}>`

  ${paperCard}
  margin: 1rem 0;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  animation: ${bottomFadeIn} 1s ease;

  @media screen and (max-width: 780px) {
    padding: 1.25rem 1.5rem;
  }

  @media screen and (max-width: 580px) {
    padding: 1.25rem 1rem;
    border-radius: unset;
  }
  
  & > .content {
    position: relative;
    height: ${props => props.$isCollapse === true ? "19rem" : "auto"};
    overflow: hidden;
    /* transition: height 0.5s ease; */
  }
`

const MemoMeta = styled.div`
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

    & .tag {
      color: ${p => p.theme.colors.gold};
    }

    & .tag:hover {
      cursor: pointer;
      color: ${p => p.theme.colors.goldHover};
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

const NavCard = styled.section`
    margin-top: 1.5rem;
    padding-left: 1rem;
    display: flex;
    flex-direction: column;
    
    

    .item {
      padding: 0.25rem 0;
      margin-right: 0.75rem;
      border-right: 2px solid ${p => p.theme.colors.uiLineGray};
    }

    .item.active {
      border-right: 2px solid ${p => p.theme.colors.gold};
    }

    .title {
      font-weight: bold;
      margin-right: 0.25rem;
    }

    .count {
      font-size: 0.875rem;
      color: ${p => p.theme.colors.textGray};
    }
`

const CardCommon = styled.section`
  margin-top: 1rem;
  padding: 1rem 1rem;
`

const CardTitle = styled.div`
  font-size: 0.9rem;
  font-weight: bold;
  color: ${p => p.theme.colors.textGray2};
`

const CardTitleIcon = styled(CardTitle)`
  text-align: right;
  font-size: 1.125rem;
  margin: unset;
`

const SearchBox = styled.input`
  border: 1px solid ${p => p.theme.colors.uiLineGray};
  border-radius: 1em;
  padding-left: 1em;
  background: ${p => p.theme.colors.bg};
  color: ${p => p.theme.colors.textPrimary};
  width:  0;
  flex: 2 1 0;
  line-height: 1.7rem;
  font-size: 0.9rem;


  &:focus,
  &:focus-visible{
    outline: none;
    border: 1px solid ${p => p.theme.colors.goldHover};
  }
`

const TagCard = styled(CardCommon)`
`