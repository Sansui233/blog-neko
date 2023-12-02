import fs from "fs";
import path from "path";
import readline from "readline";
import { dateToYMDMM, parseDate } from "../../date";
import { getLastModTime, writeJson } from "../../fs/fs";
import { INFOFILE, MemoImg, MemoPost, MemoTag } from "../memos.common";
import { MemoFileMap, MemoInfoExt, MemoPageMap } from "./type";

export const MEMOS_DIR = path.join(process.cwd(), 'source', 'memos')
const MEMO_CSR_DATA_DIR = path.join(process.cwd(), 'public', 'data', 'memos')

/**
 * memos database
 * 构造函数返回一个 memo_db 对象
 */
const memo_db = await (async function () {

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

  const tags: MemoTag[] = [];
  const memos: MemoPost[] = []
  const imgs: MemoImg[] = []
  const fileMap: MemoFileMap[] = []
  const pageMap: MemoPageMap[] = []

  /**
   * Get memos by page. SSR only
   * @param page number from 0
   */
  const atPage = function (page: number) {
    return memos.filter(m => {
      return m.csrIndex[0] === page
    })
  }

  /**
   *   Core Initialize
   **/

  console.log("[memos.ts] parsing memos...")

  let csrPage = -1;
  let csrIndex = 9;

  for (const src_file of names) {

    // state
    let isFirstLine = true
    let isFrontMatter = false
    let isFirstMemo = true

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
      } else if (isFrontMatter) {
        continue; //ignore in front matter
      } else if (line.startsWith("## ")) {

        updateLastFile(memos, tags, imgs, fileMap)

        // 更新索引状态
        csrIndex += 1;
        if (csrIndex === 10) {
          if(pageMap.length > 0){
            pageMap[pageMap.length - 1].endDate = parseDate(memos[memos.length-1].id).getTime()
          }

          csrPage += 1;
          csrIndex = 0;

          pageMap.push({
            page: csrPage,
            startDate: parseDate(line.slice(3)).getTime(),
            endDate: -1,
          })
        }

        /**
         * add new memo
         */

        memos.push({
          id: line.slice(3),
          content: "",
          tags: [],
          imgsmd: [],
          sourceFile: src_file,
          csrIndex: [csrPage, csrIndex],
        })

        // add new info
        if (isFirstMemo) {
          fileMap.push({
            srcName: src_file,
            lastModified: (await getLastModTime(path.join(MEMOS_DIR, src_file))).getTime(),
            dateRange: { start: dateToYMDMM(parseDate(memos[memos.length - 1].id)), end: "" },
            startAt: {
              page: csrPage,
              index: csrIndex,
            },
            endAt: {
              page: -1,
              index: -1,
            }
          })
          isFirstMemo = false
        }

      } else {

        // detect imgs
        const imgreg = /\!\[.*\]\(.+\)/g;
        const matches = line.match(imgreg);
        if (matches) {
          // console.debug("%%", memos[memos.length - 1].id, matches),
          memos[memos.length - 1].imgsmd.push(...matches)
        } else {
          // update memo content
          if (memos.length === 0) continue // 忽略 frontmatter 和 ## 之间的空行
          const m = memos[memos.length - 1]
          m.content += line + "\n"
        }
      }
    }

    rl.close()
    fileStream.close()
  }

  // 文件遍历结束时更新最后一条信息
  updateLastFile(memos, tags, imgs, fileMap)
  const info: MemoInfoExt = {
    pages: csrPage,
    memos: memos.length,
    tags: tags.length,
    imgs: imgs.length,
    fileMap,
    pageMap,
  }

  console.log(`[memos.ts] ${memos.length} memos in total`)

  return {
    names,
    memos,
    tags,
    info,
    atPage,
  }
})()


// 根据memo内容，补全tags, imgs, fileMap 的状态信息
function updateLastFile(memos: MemoPost[], tags: MemoTag[], imgs: MemoImg[], fileMap: MemoFileMap[]) {
  if (memos.length > 0) {

    const lastMemo = memos[memos.length - 1]
    const text = lastMemo.content 

    // update tags
    const matches = extractTagsFromMarkdown(text)
    matches.map(t => {

      const target = tags.find((v) => v.name === t)

      if (target) {
        target.memoIds.push(lastMemo.id)
      } else {
        tags.push({
          name: t,
          memoIds: [lastMemo.id]
        })
      }

      if (!lastMemo.tags.includes(t)) lastMemo.tags.push(t)
    })

    // update imgs
    if (lastMemo.imgsmd.length !== 0) {
      imgs.push({
        memoId: lastMemo.id,
        imgsMd: lastMemo.imgsmd,
      })
    }


    // update last info
    const lastInfo = fileMap[fileMap.length - 1]
    lastInfo.dateRange.end = dateToYMDMM(parseDate(lastMemo.id))
    lastInfo.endAt = { page: lastMemo.csrIndex[0], index: lastMemo.csrIndex[1] }

  }
}


/**
 * generated by chatgpt
 */
function extractTagsFromMarkdown(markdown: string) {
  const tagRegex = /#([^\s#]+)(?![^\[]*\])/g; // 正则表达式用于匹配标签

  const tags = [];
  let match;
  while ((match = tagRegex.exec(markdown)) !== null) {
    const tag = match[1];
    // 检查标签的长度是否不超过14
    if (tag.length <= 14) {
      // 检查标签是否在代码块中
      const codeBlockRegex = /```[\s\S]*?```/g;
      const codeBlocks = markdown.match(codeBlockRegex) || [];
      let isInsideCodeBlock = false;
      for (const codeBlock of codeBlocks) {
        if (codeBlock.includes(match[0])) {
          isInsideCodeBlock = true;
          break;
        }
      }

      // 检查标签是否在链接语法中
      const linkRegex = /\[([^\]]+)\]\([^\)]+\)/g;
      const links = markdown.match(linkRegex) || [];
      let isInsideLink = false;
      for (const link of links) {
        if (link.includes(match[0])) {
          isInsideLink = true;
          break;
        }
      }

      if (!isInsideCodeBlock && !isInsideLink) {
        tags.push(tag);
      }
    }
  }

  return tags;
}


function writeMemoJson() {

  // CSR page
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

  writeJson(path.join(MEMO_CSR_DATA_DIR, INFOFILE), memo_db.info)
  writeJson(path.join(MEMO_CSR_DATA_DIR, `tags.json`), memo_db.tags)
}

export { memo_db, writeMemoJson };

