import fs from "fs";
import path from "path";
import readline from "readline";
import { writeJson } from "../fs/fs";
import { INFOFILE, MemoInfo, MemoPost, MemoTag } from "./memos.common";

export const MEMOS_DIR = path.join(process.cwd(), 'source', 'memos')
const MEMO_CSR_DATA_DIR = path.join(process.cwd(), 'public', 'data', 'memos')
const NUM_PER_PAGE = 12

/**
 * memos database
 * 构造函数返回一个 memo_db 对象
 */
export const memo_db = await (async function () {

  /**
   * Exported properies
   */
  const names = await ((async () => {
    let fileNames = await fs.promises.readdir(MEMOS_DIR);
    return fileNames.filter(f => {
      return f.endsWith(".md")
    }).sort((a, b) => {
      return a < b ? 1 : -1 // Desc for latest first
    })
  })())
  const tags: MemoTag[] = []
  const memos: MemoPost[] = []

  /**
   * Get memos by page. SSR only
   * @param page number from 0
   */
  const atPage = function (page: number) {
    return memos.filter(m => {
      m.csrIndex[0] === page
    })
  }

  /**
   *   Core Initialize
   **/

  console.log("[memos.ts] parsing memos......")

  let csrPage = 0;
  let csrIndex = -1; // 由於是新建条目前更新状态，因此從-1開始

  for (const src_file of names) {

    // state
    let isFirstLine = true
    let isFrontMatter = false

    const fileStream = fs.createReadStream(path.join(MEMOS_DIR, src_file))
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    for await (const line of rl) {
      if (line.startsWith("---") && isFirstLine) {
        if (isFrontMatter) { // front matter end
          isFrontMatter = false
          isFirstLine = false
          continue
        } else {
          isFrontMatter = true // front matter start
          continue
        }
      } else if (line.startsWith("## ")) {
        // 更新條目
        csrIndex += 1;
        if (csrIndex === 10) {
          csrPage += 1;
          csrIndex = 0;
        }

        // add new memo
        memos.push({
          id: line.slice(3),
          content: "",
          imgurls: [],
          sourceFile: src_file,
          csrIndex: [csrPage, csrIndex],
        })
      } else {
        // TODO parse tag

        // TODO parse imgs

        // update memo content
        if (memos.length === 0) continue // 忽略 yaml 和 ## 之间的空行
        const m = memos[memos.length - 1]
        m.content += line + "\n"
      }
    }

    rl.close()
    fileStream.close()
  }


  return {
    names,
    tags,
    memos,
    atPage,
  }

})()

export function writeMemoJson() {

  const groupByPage = new Map<number, MemoPost[]>()
  let maxpage = 0;

  memo_db.memos.forEach(m => {
    const p = m.csrIndex[0]
    if (groupByPage.has(p)) {
      groupByPage.get(p)?.push(m)
    } else {
      groupByPage.set(p, [m])
    }
    maxpage = p > maxpage ? p : maxpage;
  })
  
  groupByPage.forEach((memos, page) => {
    writeJson(path.join(MEMO_CSR_DATA_DIR, `${page}.json`), memos)
  })

  const info: MemoInfo = {
    pages: maxpage,
    fileMap: []
  }

  writeJson(path.join(MEMO_CSR_DATA_DIR, INFOFILE), info)
}