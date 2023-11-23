import React, { useCallback, useState } from 'react'
import { Naive, Result, SearchObj } from './search'
import { useDocumentEvent } from './use-event'

const createNaive = await (import("./search").then(mod => mod.createNaive))

export type SearchStatus = {
  isSearch: "ready" | "searching" | "done",
  searchText: string,
}

type Props<R> = {
  inputRef: React.RefObject<HTMLInputElement>,
  setRes: React.Dispatch<React.SetStateAction<R[]>>
  initData: () => Promise<{
    searchObj: SearchObj[]
    filterRes: (searchres: Required<Result>[]) => R[] | Promise<R>[]
  }>
}

function useSearch<R>({ inputRef, setRes, initData }: Props<R>) {
  const [engine, setEngine] = useState<Naive>()
  const [searchStatus, setsearchStatus] = useState<SearchStatus>({
    isSearch: "ready",
    searchText: "",
  })

  const initSearch = useCallback(async () => {

    console.debug("%% init search...")
    let newEngine: Naive | undefined = undefined;


    const { searchObj, filterRes } = await initData()

    // 过滤结果
    // 这个函数也会持久化下载数据
    function notifier(searchres: Required<Result>[]) {
      const filtered = filterRes(searchres)
      Promise.all(filtered).then(
        res => {
          setRes(res)
          setsearchStatus(status => ({
            ...status,
            isSearch: "done",
          }))
        }
      )
    }

    newEngine = createNaive({
      data: searchObj, 
      field: ["tags", "content"], 
      notifier, 
      disableStreamNotify: true,
    })

    setEngine(newEngine)
    setsearchStatus(status => {
      return { ...status, }
    })

    return newEngine
  }, [initData, setRes])

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
      e = await initSearch()
    }
    e.search(str.split(" "))

  }, [initSearch, engine, inputRef])

  const setSearchText = useCallback((text: string, immediateSearch = true) => {
    if (!inputRef.current) return

    inputRef.current.value = text
    if (immediateSearch) {
      handleSearch()
    }
  }, [handleSearch, inputRef])

  // bind keyboard event
  useDocumentEvent("keydown", (evt) => {
    if (inputRef.current && inputRef.current === document.activeElement && evt.key === "Enter")
      handleSearch()
  }, undefined, [handleSearch])


  return {
    searchStatus,
    setsearchStatus,
    setSearchText,
    handleSearch,
    initSearch,
  }
}

export default useSearch