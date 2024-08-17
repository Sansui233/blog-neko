import { useEffect, useMemo, useState } from "react"
import { MemoPost } from "../../lib/data/memos.common"
import { MemoCSRAPI } from "../../pages/memos"

export default function PhotosCol() {
  const [memoData, setmemoData] = useState<MemoPost[]>([])

  // fetch data
  useEffect(() => {
    fetch(MemoCSRAPI + "/imgs.json").then(
      res => res.json() as Promise<MemoPost[]>
    ).then(
      json => setmemoData(json)
    ).catch(e => {
      console.error("[photoscol.tsx]", e)
    })
  }, [])
  const memoByMonth = useMemo(() => {
    const monthMap = new Map<string, MemoPost[]>
    memoData.forEach(memo => {
      const key = memo.id.slice(0, 7)

      // validate key should be like 2023-01
      const reg = /^\d{4}-(0[1-9]|1[0-2])$/
      if (!reg.test(key)) {
        console.error(`Memo ${memo.id} is not well formatted`)
        return
      }
      const v = monthMap.get(key)
      v ? v.push(memo) : monthMap.set(key, [memo])
    })
    return Array.from(monthMap)
  }, [memoData])

  return (
    <section>PhotosCol
      {memoByMonth.map(month => {
        return <div key={month[0]}>
          Month: {month[0]}
          {month[1].map(posts => {
            return <div key={posts.id}>
              {posts.imgsmd.toString()}
            </div>
          })}
        </div>
      })}
    </section>
  )
}
