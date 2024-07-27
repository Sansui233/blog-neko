import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { clientList, createClient } from "../../lib/data/client";
import { compileMdxMemo } from "../../lib/markdown/mdx";
import { SearchStatus } from '../../lib/use-search';
import { TMemo } from '../../pages/memos';
import Footer from "../common/footer";
import { PageDescription } from '../common/page-description';
import { MemoCard, MemoLoading } from "./memocard";
import VirtualList from "./virtuallist";

export default function MemoCol({ postsData, postsDataBackup, setpostsData, setpostsDataBackup, client, searchStatus, setsearchStatus, setSearchText }: {
  postsData: TMemo[]
  postsDataBackup: TMemo[]
  setpostsData: Dispatch<SetStateAction<TMemo[]>>
  setpostsDataBackup: Dispatch<SetStateAction<TMemo[]>>
  client: keyof typeof clientList,
  searchStatus: SearchStatus,
  setsearchStatus: Dispatch<SetStateAction<SearchStatus>>
  setSearchText: (text: string, immediateSearch?: boolean) => void
}) {


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

  //search status
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
    </>
  )
}
