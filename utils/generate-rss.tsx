import { Feed, Item } from "feed"
import { SiteInfo } from "../site.config";
import { POSTDIR } from './posts';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';
import { renderToStaticMarkup } from 'react-dom/server';
import { MDXRemote } from 'next-mdx-remote'
import fs from 'fs'

async function getLastTenPosts(): Promise<Item[]> {
  let fileNames = fs.readdirSync(POSTDIR);
  fileNames = fileNames.filter(f => {
    return f.endsWith(".md") || f.endsWith(".mdx")
  })
  let allPosts = await Promise.all(
    fileNames.map(async fileName => {
      // console.log(fileName)
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
        content: renderToStaticMarkup(
          <MDXRemote compiledSource={contentsource}></MDXRemote>
        )
      }
    }))

  allPosts = allPosts.sort((a, b) => {
    return a.date > b.date ? -1 : 1
  })
  allPosts.splice(10)
  return allPosts

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

  const posts = await getLastTenPosts()

  posts.forEach(p => {
    feed.addItem(p)
  })

  return feed
}

export async function generateFeedFile() {
  const feed = await generateFeed()
  fs.writeFileSync("./public/atom.xml", feed.atom1());
}
