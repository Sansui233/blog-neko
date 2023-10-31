import { Feed, Item } from "feed";
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { siteInfo } from "../../site.config";
import { dateToYMD } from "../date";
import { PostMeta } from "../markdown/common";
import { MEMOS_DIR } from "./memos";
import { POST_DIR, getFrontMatter } from './posts';

/**
 * Get recent 10 post
 */
async function getPosts(): Promise<Item[]> {
  let fileNames = await fs.promises.readdir(POST_DIR);
  fileNames = fileNames.filter(f => {
    return f.endsWith(".md") || f.endsWith(".mdx")
  })
  let allPosts: Item[] = (await Promise.all(
    fileNames.map(async fileName => {

       // TODO parse
      const fileContents = await fs.promises.readFile(path.join(POST_DIR, fileName), 'utf-8')
      const frontmatter:PostMeta = {
        title: "Test",
        description: "",
        date: "string",
        tags: [],
        categories: "category",
      }

      const parsed: PostMeta & {content: string, id: string} = {
        id: fileName.replace(/\.mdx?$/, ''),
        title: "Test",
        description: "",
        date: "string",
        tags: [],
        categories: "category",
        draft: false, 
        content: "",
      }

      return parsed

    })
  )).filter( p => !p.draft).map( p=>{
    
    // TODO build result
    return {
      title: p.title,
      id: `${siteInfo.domain}/posts/${p.id}`,
      guid: `${siteInfo.domain}/posts/${p.id}`,
      link: `${siteInfo.domain}/posts/${p.id}`,
      published: new Date(p.date),
      date: new Date(p.date),
      description: p.description ? p.description : '',
      category: [
        {
          name: p.categories,
          domain: `${siteInfo.domain}/categories/${p.categories}`
        }],
      content: p.content, // TODO 转换为 html 后的 Content
    }
  })

  const memo = await getMemo()
  if (memo !== null) {
    allPosts.push(memo)
  }

  allPosts = allPosts.sort((a, b) => {
    return a.date > b.date ? -1 : 1
  })

  // Filter drafts
  let res = []
  for(let p of allPosts){
    if('draft' in p && p.draft === true){
      continue
    }else {
      res.push(p)
    }
  }

  res.splice(10)
  return res
}

// 最新（名称最大）的 memo 文件中，最近 6 条生成 rss
async function getMemo(): Promise<Item | null>{
  const files = (await fs.promises.readdir(MEMOS_DIR)).filter(f => {
    return f.endsWith(".md")
  }).sort((a, b) => {
    return a < b ? 1 : -1 // Desc for latest first
  })

  // get recent non-draft memo file
  let f = ""
  for (let fileName of files){
    const fm = getFrontMatter(fileName, MEMOS_DIR)
    if ('draft' in fm && fm.draft == true){
      continue
    }else{
      f = fileName;
      break;
    }
  }

  if(f === "") {
    return  null
  }

  const fileStream = fs.createReadStream(path.join(MEMOS_DIR, f))
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })
  let count = 0
  let content = ""
  for await (const line of rl) {
    if (line.startsWith("## ")) {
      if (count === 7) break
      count++
    }
    if (count != 0) content += line + "\n" // push content
  }

  rl.close()
  fileStream.close()

  const matterResult = await getFrontMatter(f, MEMOS_DIR)
  const updateDate = dateToYMD(matterResult.data.date)

  const res = {
    title: matterResult.data.title,
    id: `${siteInfo.domain}/memos?id=${updateDate}`, // 修改时间戳将触发 rss 对于本内容的更新
    guid: `${siteInfo.domain}/memos?id=${updateDate}`, // 修改时间戳将触发 rss 对于本内容的更新
    link: `${siteInfo.domain}/memos`,
    date: matterResult.data.date,
    published: matterResult.data.date,
    description: matterResult.data.description ? matterResult.data.description : '',
    category: [
      {
        name: matterResult.data.categories
      }],
    content: "" // TODO compiled to 
  }

  return res
}

async function createRss() {
  /** File Info */
  const feed = new Feed({
    title: `${siteInfo.author}'s blog`,
    description: "记录学习和生活的个人博客",
    id: siteInfo.domain,
    link: siteInfo.domain,
    language: "zh-CN", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    // image: `${SiteInfo.domain}/avatar-white.png`,
    favicon: `${siteInfo.domain}/favicon.ico`,
    copyright: `All rights reserved 2022, ${siteInfo.author}`,
    // updated: new Date(2013, 6, 14), // optional, default = today
    // generator: "awesome", // optional, default = 'Feed for Node.js'
    feedLinks: {
      //   json: "https://example.com/json",
      json: `${siteInfo.domain}/feed.json`,
      atom: `${siteInfo.domain}/atom.xml`,
      rss: `${siteInfo.domain}/rss`,
    },
    author: {
      name: siteInfo.author,
      email: siteInfo.social.email,
      link: `${siteInfo.domain}/about.ico`
    }
  });

  const posts = await getPosts()

  posts.forEach(p => {
    feed.addItem(p)
  })

  return feed
}

export async function writeRss() {
  const feed = await createRss()
  fs.promises.writeFile("./public/atom.xml", feed.atom1());
  fs.promises.writeFile("./public/rss", feed.rss2());
  fs.promises.writeFile("./public/feed.json", feed.json1());
}
