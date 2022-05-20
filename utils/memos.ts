import fs from "fs";
import readline from 'readline'
import path from "path"

export const MEMOSDIR = path.join(process.cwd(), 'source', 'memos')
const MemoCSRDataDir = path.join(process.cwd(), 'public', 'data', 'memos')
const NumPerPage = 12

type MemoPost = {
  title: string;
  content: string;
}

const getFileNames = () => {
  let fileNames = fs.readdirSync(MEMOSDIR);
  return fileNames.filter(f => {
    return f.endsWith(".md")
  }).sort((a, b) => {
    return a < b ? 1 : -1 // Desc for latest first
  })
}

/**
 * @param page number from 0
 * @returns 
 */
export async function getMemoPosts(page: number): Promise<MemoPost[]> {
  const fileNames = getFileNames()

  // 左闭右开, start from 0
  const postRange = ((page: number) => {
    const start = page * NumPerPage
    const end = start + NumPerPage
    return [start, end]
  })(page)

  const memos: MemoPost[] = []
  let counter = -1 //由于 counter 需要从 0 开始，而后面是先加再算，所以这里是-1
  let isFrontMatter = false

  // Generate memos
  for (const fileName of fileNames) {
    const fileStream = fs.createReadStream(path.join(MEMOSDIR, fileName))
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
 * 返回 memo 可以分为多少页
 * @returns pageCount integer
 */
export async function getMemoPages(): Promise<number> {
  const fileNames = getFileNames()
  let count = 0;

  for (const fileName of fileNames) {
    const fileStream = fs.createReadStream(path.join(MEMOSDIR, fileName))
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })
    for await (const line of rl) {
      if (line.startsWith("## ")) {
        count++
      }
    }
    rl.close()
    fileStream.close()
  }
  return Math.ceil(count / NumPerPage)
}




/**
 * Generate CSR data File.
 * Seperate memos into different files
 */
export async function genMemoJsonFile() {
  const fileNames = getFileNames()

  let page = 0
  let posts: MemoPost[] = []
  let isFrontMatter = false
  for (const fileName of fileNames) {
    const fileStream = fs.createReadStream(path.join(MEMOSDIR, fileName))
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
        if (posts.length === NumPerPage) {
          writeToFs(page, posts)
          posts = []
          page++
        }
        posts.push({
          title: line.slice(3),
          content: "",
        })
      } else {
        if (isFrontMatter) continue
        if (posts.length === 0) continue // Ignore the start of the first md file
        posts[posts.length - 1].content += line + "\n" // push content
      }
    }
    rl.close()
    fileStream.close()
  }
  if (posts.length !== 0) writeToFs(page, posts) // 最后的几个
  console.log(`[memo.ts] ${page + 1} pages are generated`)
}

function writeToFs(page: number, posts: MemoPost[]) {
  mkdirsSync(MemoCSRDataDir)
  fs.writeFileSync(`${MemoCSRDataDir}/${page}.json`, JSON.stringify(posts))
}

function mkdirsSync(dirname: string) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}
