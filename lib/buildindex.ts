import fs from "fs";
import path from "path";
import { dateToString } from "./date";
import { loadJson, writeJson } from "./fs";
import { observe } from "./observer";
import { POST_DIR, getFrontMatter } from "./posts";
import { SearchObj } from "./search";



const DATADIR = path.join(process.cwd(), 'public', 'data', 'posts')
const SEARCHJSON = 'index.json'
const OBSERVEINFO = 'status.json'

/**
 * generate index file
 */
export async function buildIndex(dir=DATADIR,json=SEARCHJSON,status=OBSERVEINFO) {

  let index: Array<SearchObj> = []

  // 增量更新部分条目
  const fl = await observe(
    POST_DIR,
    path.join(DATADIR, OBSERVEINFO),
    (o, n) => { return o.mtime === n.mtime.getTime() },
    true,
    (info) => {
      return info
    },
    ".md",
  )

  index = await loadJson(path.join(DATADIR, SEARCHJSON)) as Array<SearchObj>
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
      content: await getContent(path.join(POST_DIR, n)),
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
      content: await getContent(path.join(POST_DIR, n)),
      description: fm.data['description'] ? fm.data['description'] : "",
      keywords: fm.data['keywords'] ? fm.data['keywords'] : "",
      date: dateToString(fm.data['date'])
    })
  })

  await Promise.all(modPromise.concat(createPromise))

  index = index.sort((a, b) => a.date < b.date ? 1 : -1)
  writeJson(path.join(DATADIR, SEARCHJSON), index)
  console.log("[search.ts]", index.length, "pages are indexed")
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