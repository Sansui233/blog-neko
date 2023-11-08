import { GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import { CommonHead } from ".";
import Footer from "../components/common/Footer";
import { PageDescription } from '../components/common/PageDescription';
import Pagination from "../components/common/Pagination";
import Topbar from "../components/common/Topbar";
import { TwoColLayout } from "../components/layout";
import CardCommon, { CardTitleIcon } from "../components/memo/cardcommon";
import CommentCard from "../components/memo/commentcard";
import { MemoCard } from "../components/memo/memocard";
import NavCard from "../components/memo/navcard";
import { memo_db, writeMemoJson } from "../lib/data/memos";
import { MemoInfo, MemoPost, MemoTagArr } from "../lib/data/memos.common";
import { compileMdxMemo } from "../lib/markdown/mdx";
import { Naive, Result, SearchObj } from "../lib/search";
import { useDocumentEvent } from "../lib/useEvent";
import { siteInfo } from "../site.config";
import { LinkWithLine } from "../styles/components/LinkWithLine";

const MemoCSRAPI = '/data/memos'

export type TMemo = MemoPost & {
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

export const MemoModelCtx = React.createContext({
  isModel: false,
  setIsModel: (x: boolean) => { console.error("[MemoModelCtx] model function is called without a valid context") }
})

export default function Memos({ memos, info, memotags }: Props) {
  const router = useRouter()
  const theme = useContext(ThemeContext)
  const [postsData, setpostsData] = useState(memos)
  const [postsDataBackup, setpostsDataBackup] = useState(memos)
  const [isFetching, setisFetching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [engine, setEngine] = useState<Naive>()
  const [searchStatus, setsearchStatus] = useState<SearchStatus>({
    pagelimit: 5,
    isSearch: "ready",
    searchText: "",
  })

  const handleSearch = useCallback(async () => {
    if (!inputRef.current) return
    const str = inputRef.current.value.trim()
    if (str.length === 0) return

    setsearchStatus(status => ({
      ...status,
      isSearch: "searching",
      searchText: str // possibly the search text is stale
    }))
    globalThis.scrollTo({ top: 0 })

    let e = engine
    if (!e) { // Init Search Engine && Get data
      e = await initSearch(setEngine, setpostsData, setsearchStatus, info.pages)
    }
    e.search(str.split(" "))

  }, [engine, info.pages])

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
  useDocumentEvent("keydown", (evt) => {
    if (inputRef.current && inputRef.current === document.activeElement && evt.key === "Enter")
      handleSearch()
  }, undefined, [handleSearch])

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
        hideSearch={true}
      />
      <main style={{ backgroundColor: theme?.colors.bg2 }}>
        <OneColLayout>
          <TwoColLayout
            sep={1}
            siderLocation="right"
          >
            <MemoCol>
              <PageDescription style={{ marginRight: "1rem" }}>
                {statusRender()}
              </PageDescription>
              <div style={{ minHeight: "100vh" }}>
                {isFetching ? null
                  : postsData.map(m => (
                    <MemoCard key={m.id} memoPost={m} setSearchText={setSearchText} />
                  ))}
              </div>
              <Pagination
                currTitle={`PAGE ${currPage + 1}`}
                prevPage={currPage > 0 ? {
                  title: "PREV",
                  link: `/memos?p=${currPage - 1}`
                } : undefined}
                nextPage={currPage + 1 < info.pages + 1 ? {
                  title: "NEXT",
                  link: `/memos?p=${currPage + 1}`
                } : undefined}
                maxPage={(info.pages + 1).toString()}
                elemProps={{ style: { padding: "0 1rem" } }}
                isScrollToTop={true}
              />
              {/* <Waline style={{ padding: "0 0.5rem" }} /> */}
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
              <NavCard info={info} />
              <CardCommon title={"TAGS"}>
                <div style={{ paddingTop: "0.5rem" }}>
                  {memotags.map(t => {
                    return <span className="hover-gold" style={{ display: "inline-block" }} key={t[0]}
                      onClick={() => { setSearchText("#" + t[0]) }}
                    >
                      {`#${t[0]}`}
                    </span>
                  })}
                </div>
              </CardCommon>
              {siteInfo.friends ?
                <CardCommon title="FRIENDS">
                  <div style={{ padding: "0.5rem 0.25rem" }}>
                    {siteInfo.friends.map((f, i) => <div key={i}><LinkWithLine href={f.link}>{f.name}</LinkWithLine></div>)}
                  </div>
                </CardCommon>
                : null}
              {siteInfo.walineApi && siteInfo.walineApi !== "" ? <CommentCard /> : null}
            </SiderCol>
          </TwoColLayout>
        </OneColLayout>
      </main>
    </>
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
  max-width: 650px;
  padding: 86px 16px 48px 16px;
  align-self: flex-end;

  &::-webkit-scrollbar {
    display: none;
  }

  @media screen and (min-width: 1080px) {
    max-width: 700px;
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
  padding-bottom: 64px;
  margin: 0 0.5rem;
  position: sticky;

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
    cursor: pointer;
  }

  .hover-gold:hover {
    color: ${p => p.theme.colors.gold};
  }
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