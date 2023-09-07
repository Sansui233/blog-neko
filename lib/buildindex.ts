import fs from "fs";
import path from "path";
import { dateToString } from "./date";
import { loadJson, writeJson } from "./fs";
import { observe } from "./observer";
import { getFrontMatter } from "./posts";
import { SearchObj } from "./search";

const DATADIR = path.join(process.cwd(), 'public', 'data')
const SEARCHJSON = 'index.json'
const OBSERVEINFO = 'status.json'

/**
 * generate index file
 */
export async function buildIndex(src_dir: string, data_dir = DATADIR, json = SEARCHJSON, status = OBSERVEINFO) {

  let index: Array<Required<SearchObj>> = []

  // 增量更新部分条目
  const fl = await observe(
    src_dir,
    path.join(data_dir, status),
    (o, n) => { return o.mtime === n.mtime.getTime() },
    true,
    (info) => {
      return info
    },
    ".md",
  )

  index = await loadJson(path.join(data_dir, json))
  if (!index) {
    index = []
  }

  fl.del.map(n => {
    // delete in index
    const i = find(index, n)
    if (i === -1) {
      console.error(`[search.ts] unexpected del index not found`)
      return
    }
    index.splice(i, 1)
  })

  const modPromise = fl.mod.map(async n => {
    const i = find(index, n)
    const fm = await getFrontMatter(n)
    index[i] = ({
      id: n,
      title: fm.data['title'],
      content: (await getContent(path.join(src_dir, n))).replaceAll("\n", ""),
      description: fm.data['description'] ? fm.data['description'] : "",
      keywords: fm.data['keywords'] ? fm.data['keywords'] : "",
      date: dateToString(fm.data['date'])
    })
  })

  const createPromise = fl.create.map(async n => {
    const i = find(index, n)
    const fm = await getFrontMatter(n)
    index.push({
      id: n,
      title: fm.data['title'],
      content: await getContent(path.join(src_dir, n)),
      description: fm.data['description'] ? fm.data['description'] : "",
      keywords: fm.data['keywords'] ? fm.data['keywords'] : "",
      date: dateToString(fm.data['date'])
    })
  })

  await Promise.all(modPromise.concat(createPromise))

  index = index.sort((a, b) => a.date < b.date ? 1 : -1)
  writeJson(path.join(data_dir, json), index)

  console.log("[buildindex.ts]", fl.create.length + fl.del.length + fl.mod.length, "pages updated")
  console.log("[buildindex.ts]", index.length, "pages are indexed")
}

function find(index: SearchObj[], id: string) {
  for (let i = 0; i < index.length; i++) {
    if (index[i].id === id) return i
  }
  return -1
}

async function getContent(filepath: string) {
  let content = await fs.promises.readFile(filepath, 'utf-8')
  content = content.replace(/---([\s\S]*?)---/, '') // Remove YAML header
  return content.replace(/^\s+|\s+$/g, '')
}