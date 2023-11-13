import { GetStaticProps } from "next";
import Head from "next/head";
import React, { useCallback, useContext, useRef, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import { CommonHead } from ".";
import Footer from "../components/common/Footer";
import { PageDescription } from '../components/common/PageDescription';
import Topbar from "../components/common/Topbar";
import { TwoColLayout } from "../components/layout";
import CardCommon, { CardTitleIcon } from "../components/memo/cardcommon";
import CommentCard from "../components/memo/commentcard";
import ImageBrowser from "../components/memo/imagebrowser";
import { TImage } from "../components/memo/imagesthumb";
import { MemoCard } from "../components/memo/memocard";
import NavCard from "../components/memo/navcard";
import VirtualList from "../components/memo/virtuallist";
import { clientList, createClient } from "../lib/data/client";
import { MemoInfo, MemoPost, MemoTag } from "../lib/data/memos.common";
import { memo_db, writeMemoJson } from "../lib/data/server";
import { compileMdxMemo } from "../lib/markdown/mdx";
import { Naive, Result, SearchObj } from "../lib/search";
import { useDocumentEvent } from "../lib/useEvent";
import { siteInfo } from "../site.config";
import { LinkWithLine } from "../styles/components/LinkWithLine";
import { Extend } from "../utils/typeinfer";

const MemoCSRAPI = '/data/memos'

// TMemo 的 content 是 code……
export type TMemo = Omit<MemoPost, "content"> & {
  code: string,
  length: number
}

type Props = {
  client: keyof typeof clientList,
  source: TMemo[]// 首屏 seo data
  info: Extend<MemoInfo>,
  memotags: MemoTag[], // tagname, memo list
}

type SearchStatus = {
  pagelimit: number,
  isSearch: "ready" | "searching" | "done",
  searchText: string,
}

export const MemoImgCtx = React.createContext({
  isModel: false,
  setisModel: (isModel: boolean) => { console.error("empty MemoImgCtx") },
  imagesData: new Array<TImage>(),
  setImagesData: (imagesData: TImage[]) => { console.error("empty MemoImgCtx") },
  currentIndex: 0,
  setCurrentIndex: (i: number) => { console.error("empty MemoImgCtx") }
})

export default function Memos({ source, info, memotags, client }: Props) {
  const theme = useContext(ThemeContext)
  const [postsData, setpostsData] = useState(source)
  const [postsDataBackup, setpostsDataBackup] = useState(source)
  const [isFetching, setisFetching] = useState(false)

  // imagebroswer
  const [isModel, setisModel] = useState(false)
  const [imagesData, setImagesData] = useState<TImage[]>([{ ok: "loading", index: 0, src: "", width: 1, height: 1, alt: "" }])
  const [currentIndex, setCurrentIndex] = useState(0)

  // search
  const inputRef = useRef<HTMLInputElement>(null)
  const [engine, setEngine] = useState<Naive>()
  const [searchStatus, setsearchStatus] = useState<SearchStatus>({
    pagelimit: 5,
    isSearch: "ready",
    searchText: "",
  })

  // virtual list api
  const [cli, setCli] = useState(createClient(client))
  const fetchFrom = useCallback(async (start: number, batchsize: number) => {
    return cli.queryMemoByCount(start, batchsize).then(data => {
      if (data.length > 0) {
        return Promise.all(data.map(async d => {
          return {
            ...d,
            length: d.content.length,
            code: (await compileMdxMemo(d.content)).code
          }
        }))
      } else {
        return undefined
      }
    })
  }, [cli])


  // search handler
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

  // bind keyboard event
  useDocumentEvent("keydown", (evt) => {
    if (inputRef.current && inputRef.current === document.activeElement && evt.key === "Enter")
      handleSearch()
  }, undefined, [handleSearch])

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
              setisFetching(true)
              setsearchStatus(status => {
                return {
                  ...status,
                  isSearch: "ready",
                  searchText: ""
                }
              })
              setpostsData(postsDataBackup)
              setisFetching(false)
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
        <MemoImgCtx.Provider value={{ isModel, setisModel, imagesData, setImagesData, currentIndex, setCurrentIndex }}>
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
                  {searchStatus.isSearch === "ready" // 首屏的问题……
                    ? <VirtualList<TMemo>
                      key={"vl1"}
                      sources={postsData}
                      setSources={setpostsData}
                      Elem={(props) => {
                        return <MemoCard source={props.source} setSearchText={setSearchText} triggerHeightChange={props.triggerHeightChange} />
                      }}
                      fetchFrom={fetchFrom}
                      batchsize={10}
                    /> : searchStatus.isSearch === "done"
                      ? <VirtualList<TMemo>
                        key={searchStatus.searchText}
                        sources={postsData}
                        setSources={setpostsData}
                        Elem={(props) => {
                          return <MemoCard source={props.source} setSearchText={setSearchText} triggerHeightChange={props.triggerHeightChange} />
                        }}
                        batchsize={10}
                      /> : null}
                </div>
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
                      return <span className="hover-gold" style={{ display: "inline-block" }} key={t.name}
                        onClick={() => { setSearchText("#" + t.name) }}
                      >
                        {`#${t.name}`}
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
          <ImageBrowser />
        </MemoImgCtx.Provider>
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
      code: code,
      length: m.content.length,
    }
  }))

  return {
    props: {
      client: "static",
      source: memos, // seo on fetch
      info: memo_db.info,
      memotags: memo_db.tags,
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
        code: (await compileMdxMemo(memo.content)).code,
        length: memo.content.length
      }
    })

    Promise.all(filtered).then(
      res => {
        setResultFn(res)
        setStatus(status => {
          return {
            ...status,
            isSearch: "done",
          }
        })
      }
    )
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
  width: 100%;
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
    color: ${p => p.theme.colors.accent};
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
    border: 1px solid ${p => p.theme.colors.accentHover};
  }
`