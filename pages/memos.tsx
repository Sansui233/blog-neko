import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import { CommonHead, PageDescription } from ".";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import Topbar from "../components/Topbar";
import Waline from "../components/Waline";
import { TwoColLayout } from "../components/layout";
import { MarkdownStyle } from "../components/markdown";
import { useMdxMemo } from "../components/mdx";
import { memo_db, writeMemoJson } from "../lib/data/memos";
import { MemoInfo, MemoPost, MemoTagArr } from "../lib/data/memos.common";
import { compileMdxMemo } from "../lib/markdown/mdx";
import { Naive, Result, SearchObj } from "../lib/search";
import { siteInfo } from "../site.config";
import { bottomFadeIn } from '../styles/animations';
import { paperCard, textShadow } from "../styles/styles";

const MemoCSRAPI = '/data/memos'

type TMemo = MemoPost & {
  length: number
}

type Props = {
  memos: TMemo[]// 首屏 seo data
  info: MemoInfo,
  memotags: MemoTagArr, // tagname, memo list
}

type SearchStatus = {
  pagelimit: number,
  isSearch: "ready" | "searching" | "done",
  searchText: string,
}

export default function Memos({ memos, info, memotags }: Props) {
  const [engine, setEngine] = useState<Naive>()
  const router = useRouter()
  const [postsData, setpostsData] = useState(memos)
  const [isFetching, setisFetching] = useState(false)
  const [postsDataBackup, setpostsDataBackup] = useState(memos)
  const theme = useContext(ThemeContext)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchStatus, setsearchStatus] = useState<SearchStatus>({
    pagelimit: 5,
    isSearch: "ready",
    searchText: "",
  })

  const handleSearch = useCallback(async () => {
    if (!inputRef.current) return

    const str = inputRef.current.value.trim()

    if (str.length === 0) return

    if (!engine) {
      // Init Search Engine && Get data
      const newEngine = await initSearch(setEngine, setpostsData, setsearchStatus, info.pages)
      newEngine.search(str.split(" "))
      setsearchStatus(status => {
        return {
          ...status,
          isSearch: "searching",
          searchText: str // possibly the search text is stale
        }
      })
    } else {
      engine.search(str.split(" "))
      setsearchStatus(status => {
        return {
          ...status,
          isSearch: "searching",
          searchText: str // possibly the search text is stale
        }
      })
    }
  }
    , [engine, info.pages])

  const setSearchText = useCallback((text: string, immediateSearch = true) => {
    if (!inputRef.current) return

    inputRef.current.value = text
    if (immediateSearch) {
      handleSearch()
    }
  }, [handleSearch])

  // fetch csr content by page number
  // set search
  useEffect(() => {

    let page = 0

    // page
    if (typeof (router.query.p) === 'string') {
      page = parseInt(router.query.p)
      if (isNaN(page)) {
        console.error('Wrong query p=', router.query.p)
        return
      }
      setisFetching(true)
      fetch(`${MemoCSRAPI}/${page}.json`)
        .then(res => res.json())
        .then((data) => {
          const posts = (data as Array<MemoPost>).map(async p => {
            return {
              ...p,
              content: (await compileMdxMemo(p.content)).code,
              length: p.content.length,
            }
          })
          return Promise.all(posts)
        })
        .then(nextPosts => {
          setpostsData(nextPosts)
          setpostsDataBackup(nextPosts)
        }).catch((err) => {
        }).finally(() => {
          setisFetching(false)
        });
    }

  }, [router.query])


  // bind keyboard event
  useEffect(() => {
    document.addEventListener("keydown", (evt) => {
      if (inputRef.current && inputRef.current === document.activeElement && evt.key === "Enter")
        handleSearch()
    })
  }, [handleSearch])

  const currPage = (() => {
    if (typeof (router.query.p) === 'string') {
      const page = parseInt(router.query.p)
      if (!isNaN(page)) {
        return page
      }
    }
    return 0
  })()

  function statusRender() {
    if (isFetching) return "Fetching..."
    switch (searchStatus.isSearch) {
      case "ready":
        return ""
      case "searching":
        return "Searching..."
      case "done":
        return <>
          Results: {postsData.length} memos
          <span
            style={{
              fontStyle: "normal",
              fontWeight: "bold",
              cursor: "pointer",
              marginLeft: "0.875em"
            }}
            onClick={() => {
              setsearchStatus(status => {
                return {
                  ...status,
                  isSearch: "ready",
                  searchText: ""
                }
              })
              setpostsData(postsDataBackup)
            }}
          >X</span>
        </>
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
              <PageDescription style={{ marginRight: "1rem" }}>
                {statusRender()}
              </PageDescription>
              <div style={{ minHeight: "100vh" }}>
                {isFetching ? null
                  : postsData.map(m => (
                    <MemoCard key={m.id} memoPost={m} scrollref={scrollRef} setSearchText={setSearchText} />
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
                isScrollToTop={true}
                scrollRef={scrollRef}
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
                  onClick={handleSearch}
                >
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
                    return <span className="hover-gold" key={t[0]}
                      onClick={() => { setSearchText("#" + t[0]) }}
                    >
                      {`#${t[0]}`}
                    </span>
                  })}
                </div>
              </TagCard>
            </SiderCol>
          </TwoColLayout>
        </OneColLayout>
      </main>
    </>
  )
}

function MemoCard({ memoPost, scrollref, setSearchText }: {
  memoPost: TMemo,
  scrollref: React.RefObject<HTMLDivElement>
  setSearchText: (text: string, immediateSearch?: boolean) => void
}) {
  const [isCollapse, setfisCollapse] = useState(true)
  const theme = useContext(ThemeContext)
  const ref = React.useRef<HTMLDivElement>(null)


  // bind tag click event in DOM way
  // TODO how to do it in react way?
  useEffect(() => {
    if (!ref.current) return

    const tagelems = ref.current.getElementsByClassName("tag")
    const elems = Array.from(tagelems).filter(e => {
      if (e instanceof HTMLSpanElement) return true
      return false
    })

    console.debug("[memos.tsx] tag count", elems.length)

    const handlers = elems.map(e => () => { e.textContent ? setSearchText(e.textContent, true) : undefined })

    elems.forEach((e, i) => e.addEventListener('click', handlers[i]))

    return () => {
      elems.forEach((e, i) => e.removeEventListener('click', handlers[i]))
    }
  }, [ref, setSearchText])



  const shouldCollapse = memoPost.length > 200 ? true : false

  function handleExpand(e: React.MouseEvent<HTMLDivElement>) {
    // Scroll back
    if (!isCollapse) {
      const element = ref.current;
      if (element) {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < 0 || elementTop > window.innerHeight) {
          scrollref.current?.scrollTo({
            top: elementTop + scrollref.current.scrollTop,
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
          <img className="avatar" src={theme!.assets.favico} alt={siteInfo.author} />
          <div className="meta">
            <div>{siteInfo.author}</div>
            <div className="date">
              {memoPost.id}&nbsp;&nbsp;
              <span className="word-count">{memoPost.length}&nbsp;字</span>
            </div>
          </div>
        </MemoMeta>

        <MemoMarkdown $bottomSpace={shouldCollapse}>
          {useMdxMemo(memoPost.content)}
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


export const getStaticProps: GetStaticProps<Props> = async () => {
  // 生成 CSR 所需 JSON，SSR 需独立出逻辑
  writeMemoJson()

  const memos: TMemo[] = await Promise.all(memo_db.atPage(0).map(async m => {
    const { code } = await compileMdxMemo(m.content)
    return {
      ...m,
      content: code,
      length: m.content.length,
    }
  }))

  return {
    props: {
      memos, // seo on fetch
      info: memo_db.info,
      memotags: Array.from(memo_db.tags),
    }
  }
}


/**
 * init engine and interact with react state
 * @param setEngine 
 * @param setResultFn 
 * @param setStatus 
 * @param maxPage 
 * @param pagelimit 
 * @returns  new engine for immediate usage
 */
async function initSearch(
  setEngine: React.Dispatch<React.SetStateAction<Naive | undefined>>,
  setResultFn: React.Dispatch<React.SetStateAction<TMemo[]>>,
  setStatus: React.Dispatch<React.SetStateAction<SearchStatus>>,
  maxPage: number, // max csrpage
  pagelimit = 5, // new range limit
) {

  console.debug("%% init search...")
  pagelimit = maxPage < pagelimit ? maxPage : pagelimit;
  let newEngine: Naive | undefined = undefined;

  // Fetch data and set search engine
  const urls = Array.from({ length: pagelimit + 1 }, (_, i) => `${MemoCSRAPI}/${i}.json`)
  const requests = urls.map(url => fetch(url).then(res => res.json()));
  const reqres = await Promise.all(requests)


  const src = (reqres as MemoPost[][]).flatMap(v => v)

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
    }).map(async memo => {
      return {
        ...memo,
        content: (await compileMdxMemo(memo.content)).code,
        length: memo.content.length
      }
    })

    Promise.all(filtered).then(
      res => setResultFn(res)
    )

    setStatus(status => {
      return {
        ...status,
        isSearch: "done",
      }
    })

  }

  newEngine = new Naive({
    data: searchObj,                    // search in these data
    field: ["tags", "content"],         // properties to be searched in data
    notifier,                            // 通常是 useState 的 set 函数
    disableStreamNotify: true,
  })

  setEngine(newEngine)
  setStatus(status => {
    return { ...status, pagelimit }
  })

  return newEngine
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
  max-width: 672px;
  padding: 86px 16px 48px 16px;
  align-self: flex-end;
  overflow-y: auto;
  height: 100vh;

  &::-webkit-scrollbar {
    display: none;
  }


  @media screen and (max-width: 780px) {
    width: 100%;
  }

  @media screen and (max-width: 580px) {
    padding: 86px 0 48px 0;
  }

`

const SiderCol = styled.div`
  max-width: 15rem;
  padding-top: 100px;
  margin: 0 0.5rem;

  height: 100vh;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  
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

    & > .avatar {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      border: 1px solid ${p => p.theme.colors.uiLineGray};
    }

    & .meta{
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