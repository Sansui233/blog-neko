import { Feed, Item } from "feed"
import { SiteInfo } from "../site.config";
import { getFrontMatter, POSTDIR } from './posts';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';
import { renderToStaticMarkup } from 'react-dom/server';
import { MDXRemote } from 'next-mdx-remote'
import fs from 'fs'
import readline from 'readline'
import { MEMOSDIR } from "./memos";
import remarkGfm from "remark-gfm";

async function getPosts(): Promise<Item[]> {
  let fileNames = fs.readdirSync(POSTDIR);
  fileNames = fileNames.filter(f => {
    return f.endsWith(".md") || f.endsWith(".mdx")
  })
  let allPosts: Item[] = await Promise.all(
    fileNames.map(async fileName => {
      const fileContents = fs.readFileSync(path.join(POSTDIR, fileName), 'utf-8')
      const mdxSource = await serialize(fileContents, { parseFrontmatter: true })

      const frontmatter = mdxSource.frontmatter! as any
      const contentsource = mdxSource.compiledSource
      const id = fileName.replace(/\.mdx?$/, '')

      return {
        title: frontmatter.title,
        id: `${SiteInfo.domain}/posts/${id}`,
        link: `${SiteInfo.domain}/posts/${id}`,
        date: frontmatter.date,
        description: frontmatter.description ? frontmatter.description : '',
        category: [
          {
            name: frontmatter.categories,
            domain: `${SiteInfo.domain}/posts/${frontmatter.categories}`
          }],
        content: renderToStaticMarkup(
          <MDXRemote compiledSource={contentsource}></MDXRemote>
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

async function getMemo(): Promise<Item> {
  const f = fs.readdirSync(MEMOSDIR).filter(f => {
    return f.endsWith(".md")
  }).sort((a, b) => {
    return a < b ? 1 : -1 // Desc for latest first
  })[0]
  const fileStream = fs.createReadStream(path.join(MEMOSDIR, f))
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })
  let count = 0
  let content = ""
  for await (const line of rl) {
    if (line.startsWith("## ")) {
      if (count === 6) break
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

  const matterResult = getFrontMatter(f, MEMOSDIR)

  const res = {
    title: matterResult.data.title,
    id: `${SiteInfo.domain}/memos`,
    link: `${SiteInfo.domain}/memos`,
    date: matterResult.data.date,
    description: matterResult.data.description ? matterResult.data.description : '',
    category: [
      {
        name: matterResult.data.categories
      }],
    content: renderToStaticMarkup(
      <MDXRemote compiledSource={mdxSource.compiledSource}></MDXRemote>
    )
  }

  return res
}

async function generateFeed() {
  /** File Info */
  const feed = new Feed({
    title: "Sansui's blog",
    description: "记录学习和生活的个人博客",
    id: SiteInfo.domain,
    link: SiteInfo.domain,
    language: "zh-CN", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    // image: `${SiteInfo.domain}/avatar-white.png`,
    favicon: `${SiteInfo.domain}/favicon.ico`,
    copyright: "All rights reserved 2022, Sansui",
    // updated: new Date(2013, 6, 14), // optional, default = today
    // generator: "awesome", // optional, default = 'Feed for Node.js'
    feedLinks: {
      //   json: "https://example.com/json",
      atom: `${SiteInfo.domain}/atom.xml`,
    },
    author: {
      name: "Sansui",
      email: "sansuilnm@gmail.com",
      link: `${SiteInfo.domain}/about.ico`
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
}
