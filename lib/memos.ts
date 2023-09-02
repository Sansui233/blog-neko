import fs from "fs";
import path from "path";
import readline from 'readline';
import { getLastModTime, loadJson, writeJson } from "./fs";
import { FileInfo, INFOFILE, MemoInfo } from "./memos.common";

export const MEMOS_DIR = path.join(process.cwd(), 'source', 'memos')
const MEMO_CSR_DATA_DIR = path.join(process.cwd(), 'public', 'data', 'memos')
const NUM_PER_PAGE = 12

type MemoPost = {
  title: string;
  content: string;
}

/**
 * Get markdown filename (with suffix) , sort by name desc
 */
async function getSrcNames() {
  let fileNames = await fs.promises.readdir(MEMOS_DIR);
  return fileNames.filter(f => {
    return f.endsWith(".md")
  }).sort((a, b) => {
    return a < b ? 1 : -1 // Desc for latest first
  })
}

/**
 * Get memos by page. SSR only
 * @param page number from 0
 */
export async function getMemoPosts(page: number): Promise<MemoPost[]> {
  const fileNames = await getSrcNames()

  // 左闭右开, start from 0
  const postRange = ((page: number) => {
    const start = page * NUM_PER_PAGE
    const end = start + NUM_PER_PAGE
    return [start, end]
  })(page)

  const memos: MemoPost[] = []
  let counter = -1 //由于 counter 需要从 0 开始，而后面是先加再算，所以这里是-1
  let isFrontMatter = false

  // Generate memos
  for (const fileName of fileNames) {
    const fileStream = fs.createReadStream(path.join(MEMOS_DIR, fileName))
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })
    let isFirstLine = true
    for await (const line of rl) {
      if (line.startsWith("---") && isFirstLine) {
        if (isFrontMatter) {
          isFrontMatter = false
          isFirstLine = false
          continue
        } else {
          isFrontMatter = true
          continue
        }
      }
      if (line.startsWith("## ")) {
        counter++
        if (counter < postRange[0]) {
          continue
        }
        if (counter >= postRange[1]) {
          break
        }
        // create a new post
        memos.push({
          title: line.slice(3),
          content: "",
        })
      } else {
        if (isFrontMatter) continue
        if (memos.length === 0) continue // Ignore the start of a md file
        memos[memos.length - 1].content += line + "\n" // push content
      }
    }
    rl.close()
    fileStream.close()
  }

  // convert to html
  return memos
}

/**
 * Generate CSR data File: {pagenumber}.json and memosinfo.json
 * SSR only
 * Seperate memos into different files
 */
export async function writeMemoJson() {
  const srcNames = await getSrcNames() // with .md suffix
  const oldInfo = await (loadJson(path.join(MEMO_CSR_DATA_DIR, INFOFILE))) as MemoInfo // 边界条件：oldInfo 可能为 undefined

  // result container
  let memos: MemoPost[] = []
  const memosInfo: MemoInfo = { pages: 0, fileMap: [] }

  // status
  let page = 0
  let isFrontMatter = false
  let startUpdate = false


  // Traverse all memo md files, turn into {page.json}
  // 基于fs的增量更新很难做，因为大量旧文件删除会影响页数，只能保证从修改的文件开始更新
  for (const [i, srcName] of Object.entries(srcNames)) {

    if (!startUpdate && oldInfo && oldInfo.fileMap.length !== 0) {

      const oldFile = oldInfo.fileMap[Number.parseInt(i)]

      const isIdentical = await (async function () {
        if (oldFile.srcName === srcName) {
          const lastModified = (await getLastModTime(path.join(MEMOS_DIR, srcName))).getTime()
          if (oldFile.lastModified === lastModified) {
            return true
          }
        }
        return false
      })()

      // skip for unmodified md files
      if (isIdentical) {
        memosInfo.fileMap.push(oldFile)
        memosInfo.pages = oldFile.endAt.page
        console.debug('[memos.ts]', `skip re-parse for ${srcName} in ${MEMOS_DIR}`)
        continue

      } else {
        // set update start point 
        page = oldFile.startAt.page
        const oldmemos = await loadJson(path.join(MEMO_CSR_DATA_DIR, `${page}.json`))
        if(oldmemos){
          memos = oldmemos.slice(0, oldFile.startAt.index)
        }
        startUpdate = true
      }

    } else {
      startUpdate = true
    }

    console.debug('[memos.ts]', `parse memo file ${srcName} in ${MEMOS_DIR}`)

    // update memosInfo
    const fInfo: FileInfo = {
      srcName: srcName,
      lastModified: (await getLastModTime(path.join(MEMOS_DIR, srcName))).getTime(),
      startAt: {
        page: page,
        index: memos.length
      },
      endAt: {
        page: page,
        index: memos.length
      }

    }

    // Read file
    const fileStream = fs.createReadStream(path.join(MEMOS_DIR, srcName))
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })
    let isFirstLine = true

    for await (const line of rl) {
      // Skip yaml header at start
      if (line.startsWith("---") && isFirstLine) {
        if (isFrontMatter) {
          isFrontMatter = false
          isFirstLine = false
          continue
        } else {
          isFrontMatter = true
          continue
        }
      }

      // Parse memo
      if (line.startsWith("## ")) {
        // Pagination
        if (memos.length === NUM_PER_PAGE) {
          writeJson(path.join(MEMO_CSR_DATA_DIR, `${page}.json`), memos)
          memos = []
          page++
        }
        memos.push({
          title: line.slice(3),
          content: "",
        })
      } else {
        // Skip yaml header at start
        if (isFrontMatter) continue
        // Ignore the start of the first md file
        if (memos.length === 0) continue

        // Push memo data
        memos[memos.length - 1].content += line + "\n"

        // update status
        memosInfo.pages = page
        fInfo.endAt.page = page
        fInfo.endAt.index = memos.length - 1 
      }
    }

    // update status
    memosInfo.fileMap.push(fInfo)

    rl.close()
    fileStream.close()
  }

  if (memos.length !== 0) writeJson(path.join(MEMO_CSR_DATA_DIR, `${page}.json`), memos) // 最后的几个
  writeJson(path.join(MEMO_CSR_DATA_DIR, INFOFILE), memosInfo)

  console.log(`[memos.ts] ${memosInfo.pages + 1} pages are generated\n`)
}