import { Feed, Item } from "feed";
import fs from 'fs';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import readline from 'readline';
import remarkGfm from "remark-gfm";
import { siteInfo } from "../site.config";
import { dateToYMD } from "./date";
import { MEMOS_DIR } from "./memos";
import { POST_DIR, getFrontMatter } from './posts';

async function getPosts(): Promise<Item[]> {
  let fileNames = fs.readdirSync(POST_DIR);
  fileNames = fileNames.filter(f => {
    return f.endsWith(".md") || f.endsWith(".mdx")
  })
  let allPosts: Item[] = await Promise.all(
    fileNames.map(async fileName => {
      const fileContents = fs.readFileSync(path.join(POST_DIR, fileName), 'utf-8')
      const mdxSource = await serialize(
        fileContents, 
        { 
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [],
            format: 'mdx',
          },
          parseFrontmatter: true
        })

      const frontmatter = mdxSource.frontmatter! as any
      const contentsource = mdxSource.compiledSource
      const id = fileName.replace(/\.mdx?$/, '')

      return {
        title: frontmatter.title,
        id: `${siteInfo.domain}/posts/${id}`,
        guid: `${siteInfo.domain}/posts/${id}`,
        link: `${siteInfo.domain}/posts/${id}`,
        published: frontmatter.date,
        date: frontmatter.date,
        description: frontmatter.description ? frontmatter.description : '',
        category: [
          {
            name: frontmatter.categories,
            domain: `${siteInfo.domain}/categories/${frontmatter.categories}`
          }],
        content: renderToStaticMarkup(
          <MDXRemote compiledSource={contentsource} scope={null} frontmatter={null}></MDXRemote>
        )
      }
    }))

  allPosts.push(await getMemo())

  allPosts = allPosts.sort((a, b) => {
    return a.date > b.date ? -1 : 1
  })
  allPosts.splice(10)
  return allPosts
}

// 最新 memo 文件中最近 6 条生成 rss
async function getMemo(): Promise<Item> {
  const f = fs.readdirSync(MEMOS_DIR).filter(f => {
    return f.endsWith(".md")
  }).sort((a, b) => {
    return a < b ? 1 : -1 // Desc for latest first
  })[0]
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

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
    }
  })

  rl.close()
  fileStream.close()

  const matterResult = getFrontMatter(f, MEMOS_DIR)
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
    content: renderToStaticMarkup(
      <MDXRemote compiledSource={mdxSource.compiledSource} scope={null} frontmatter={null}></MDXRemote>
    )
  }

  return res
}

async function generateFeed() {
  /** File Info */
  const feed = new Feed({
    title: "Sansui's blog",
    description: "记录学习和生活的个人博客",
    id: siteInfo.domain,
    link: siteInfo.domain,
    language: "zh-CN", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    // image: `${SiteInfo.domain}/avatar-white.png`,
    favicon: `${siteInfo.domain}/favicon.ico`,
    copyright: "All rights reserved 2022, Sansui",
    // updated: new Date(2013, 6, 14), // optional, default = today
    // generator: "awesome", // optional, default = 'Feed for Node.js'
    feedLinks: {
      //   json: "https://example.com/json",
      json: `${siteInfo.domain}/feed.json`,
      atom: `${siteInfo.domain}/atom.xml`,
      rss: `${siteInfo.domain}/rss`,
    },
    author: {
      name: "Sansui",
      email: "sansuilnm@gmail.com",
      link: `${siteInfo.domain}/about.ico`
    }
  });

  const posts = await getPosts()

  posts.forEach(p => {
    feed.addItem(p)
  })

  return feed
}

export async function generateFeedFile() {
  const feed = await generateFeed()
  fs.writeFileSync("./public/atom.xml", feed.atom1());
  fs.writeFileSync("./public/rss", feed.rss2());
  fs.writeFileSync("./public/feed.json", feed.json1());
}
