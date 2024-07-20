import { MenuSquare, Search, TagIcon, Users, X } from "lucide-react";
import { GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useCallback, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styled, { ThemeContext } from "styled-components";
import { CommonHead } from ".";
import ButtonFloat from "../components/common/button-float";
import Footer from "../components/common/footer";
import { PageDescription } from '../components/common/page-description';
import Topbar from "../components/common/topbar";
import { TwoColLayout } from "../components/layout";
import CardCommon from "../components/memo/cardcommon";
import CommentCard from "../components/memo/commentcard";
import { useImageBroswerStore } from "../components/memo/imagebrowser";
import { MemoCard, MemoLoading } from "../components/memo/memocard";
import NavCard from "../components/memo/navcard";
import VirtualList from "../components/memo/virtuallist";
import { LinkWithLine } from "../components/styled/link-with-line";
import { clientList, createClient } from "../lib/data/client";
import { MemoInfo, MemoPost, MemoTag } from "../lib/data/memos.common";
import { memo_db, writeMemoJson } from "../lib/data/server";
import { compileMdxMemo } from "../lib/markdown/mdx";
import { SearchObj } from "../lib/search";
import { useDocumentEvent } from "../lib/use-event";
import useSearch from "../lib/use-search";
import { siteInfo } from "../site.config";
import { floatMenu } from "../styles/css";
import { Extend } from "../utils/type-utils";

const ImageBrowser = dynamic(() => import("../components/memo/imagebrowser"))

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

export default function Memos({ source, info, memotags, client }: Props) {
  const theme = useContext(ThemeContext)
  const [postsData, setpostsData] = useState(source)
  const [postsDataBackup, setpostsDataBackup] = useState(source)
  const [isMobileSider, setIsMobileSider] = useState(false)
  const [t, i18n] = useTranslation()

  const isModel = useImageBroswerStore(state => state.isModel)

  // virtual list
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

  // search
  // TODO set page limitation
  const inputRef = useRef<HTMLInputElement>(null)
  const { searchStatus, setsearchStatus, setSearchText, handleSearch, initSearch } = useSearch<TMemo>({
    inputRef,
    setRes: setpostsData,
    initData: async () => {   // fetch data and set search engine
      const urls = Array.from({ length: info.pages + 1 }, (_, i) => `${MemoCSRAPI}/${i}.json`)
      const requests = urls.map(url => fetch(url).then(res => res.json()));
      const resp = await Promise.all(requests)
      const src = (resp as MemoPost[][]).flatMap(v => v)
      const searchObj: SearchObj[] = src.map(memo => ({
        id: memo.id,
        title: "", // 无效化 title。engine 动态构建结果写起来太麻烦了，以后再说。
        content: memo.content,
        tags: memo.tags,
      }))

      return {
        searchObj,
        filterRes: (searchres) => {
          const ids = searchres.map(r => r.id)
          const tmemos: Promise<TMemo>[] = src.filter(memo => {
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
          return tmemos
        }
      }
    }
  })

  // 包装 handle search，空值输入不触发搜索，恢复数据
  const searchBehavior = useCallback(() => {
    if (inputRef.current && inputRef.current.value === "") {
      setpostsData(postsDataBackup)
      setsearchStatus({ searchText: "", isSearch: "ready" })
      return
    }
    handleSearch()
  }, [handleSearch, postsDataBackup, setsearchStatus])

  // bind keyboard event
  useDocumentEvent(
    "keydown",
    (evt) => {
      if (inputRef.current && inputRef.current === document.activeElement && evt.key === "Enter")
        searchBehavior()
    },
    undefined,
    [handleSearch]
  )

  function statusRender() {
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
      <main style={{
        background: theme?.colors.bg2
      }}>
        <OneColLayout>
          <ButtonFloat
            className="button-float"
            Icon={MenuSquare}
            clickHandler={(e) => setIsMobileSider(v => !v)}
          />
          <TwoColLayout
            sep={1}
            siderLocation="right"
          >
            <MemoCol>
              <PageDescription style={{ marginRight: "1rem" }}>
                {statusRender()}
              </PageDescription>
              <div style={{ minHeight: "80vh" }}>
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
                    Loading={MemoLoading}
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
              <Footer style={{ marginTop: "5rem" }} />
            </MemoCol>
            <SiderContent $isMobileSider={isMobileSider}>
              <div className="close-btn" onClick={(e) => { e.stopPropagation(); setIsMobileSider(v => !v) }}>
                小小の菜单<X size={"1.25em"} style={{ marginLeft: ".5rem" }} />
              </div>
              <SearchBox>
                <input type="text" placeholder={t("search")} ref={inputRef}
                  onFocus={
                    () => { initSearch() }
                  } />
                <Search className="hover-gold" size={"1.4rem"}
                  onClick={searchBehavior}
                />
              </SearchBox>
              <NavCard info={info} />
              <CardCommon
                Icon={TagIcon}
                title={t("tags")}
              >
                {memotags.map(t => {
                  return <span className="hover-gold" style={{ display: "inline-block", paddingRight: "0.5em" }}
                    key={t.name}
                    onClick={() => { setSearchText("#" + t.name) }}
                  >
                    {`#${t.name}`}
                  </span>
                })}

              </CardCommon>
              {siteInfo.friends
                && <CardCommon
                  title={t("friends")}
                  Icon={Users}
                >
                  {siteInfo.friends.map((f, i) => <div key={i}><LinkWithLine href={f.link}>{f.name}</LinkWithLine></div>)}
                </CardCommon>
              }
              {siteInfo.walineApi && siteInfo.walineApi !== "" && <CommentCard />}
            </SiderContent>
          </TwoColLayout>
        </OneColLayout>
        {isModel && <ImageBrowser />}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
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


const OneColLayout = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  .button-float {
    display: none;
  }

  @media screen and (max-width: 780px) {
    max-width: 100%;
    .button-float {
      display: unset;
    }
  }

  @media screen and (max-width: 580px) {
  }
`

/** Styles **/
const MemoCol = styled.div`
  width: 100%;
  padding: 73px 16px 48px 16px; /* top height + memocard margin */
  align-self: flex-end;

  &::-webkit-scrollbar {
    display: none;
  }

  @media screen and (min-width: 1080px) {
    max-width: 640px;
  }


  @media screen and (max-width: 780px) {
    width: 100%;
  }

  @media screen and (max-width: 580px) {
    padding-left: 0;
    padding-right: 0;
  }
`

const SiderContent = styled.div<{
  $isMobileSider: boolean,
}>`
  position: sticky;

  max-width: 15rem;
  padding-top: 83px; /* top height + memocard margin * 2 */
  padding-bottom: 64px;
  margin: 0 0.5rem;
  height: 100vh;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }

  .close-btn {
    display:none;
    z-index: 1;
  }
  
  @media screen and (max-width: 1080px) {
    margin: 0;
  }

  @media screen and (max-width: 780px) {
    ${floatMenu}
    position: fixed;
    bottom: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    max-width: unset;
    width: 96%;
    right: 2%;
    height: 66vh;
    padding: 0rem 1rem 1rem 1rem;
    transition: transform .3s ease;
    transform: ${p => p.$isMobileSider ? `translateY(0)` : `translateY(105%)`};

    .close-btn {
      position: sticky;
      top:0;
      background: inherit;

      display: flex;
      font-weight: 600;
      justify-content: space-between;
      align-items: center;

      padding: 1rem 0;
      ${p => p.$isMobileSider ? null : `visibility:hidden;`}
      color: ${p => p.theme.colors.textGray2};
      font-size: 1rem;
      cursor:pointer;
    }
    .close-btn:hover{
      color: ${p => p.theme.colors.accent};
    }
  }

  /* util class */
  .hover-gold {
    cursor: pointer;
  }

  .hover-gold:hover {
    color: ${p => p.theme.colors.accent};
  }
`

const SearchBox = styled.div`
  border-radius: 2rem;
  background: ${p => p.theme.colors.bg};
  color: ${p => p.theme.colors.textPrimary};
  display: flex;
  align-items: center;
  margin: 0 0.5rem; /* 无 bg 时*/
  border: 1px solid ${p => p.theme.colors.uiLineGray};

  &:focus-within {
    border: 1px solid ${p => p.theme.colors.accentHover};
  }

  input {
    border: none;
    background: inherit;
    line-height: 2rem;
    color: inherit;
    flex: 1 1 auto;
    width: 0;
    margin-left: 1rem;
  }

  input:focus,
  input:focus-visible {
    outline: none;
  }

  svg {
    margin: 0 auto;
    flex: 0  0 auto;
    margin: 0 0.6rem 0 0.5rem;
    color: ${p => p.theme.colors.uiLineGray};
  }
`