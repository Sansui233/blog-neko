import fs from 'fs'
import path from 'path';
import matter from 'gray-matter'
import { dateToYMD } from './date';

export const POSTDIR = path.join(process.cwd(), 'source', 'posts')

/**
 * used in post dynamic routes generation
 * @returns 
 */
export function getAllPostIds() {
  let fileNames = fs.readdirSync(POSTDIR);
  fileNames = fileNames.filter(f => {
    return f.endsWith(".md") || f.endsWith(".mdx")
  })
  return fileNames.map(f => {
    return {
      params: {
        id: f.replace(/\.mdx?$/, '')
      }
    }
  })
}

export function getSortedPostsMeta() {
  let fileNames = fs.readdirSync(POSTDIR);
  fileNames = fileNames.filter(f => {
    return f.endsWith(".md") || f.endsWith(".mdx")
  })
  const allPosts = fileNames.map(fileName => {
    const id = fileName.replace(/\.mdx?$/, '')
    const fullPath = path.join(POSTDIR, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)
    const date = dateToYMD(matterResult.data['date'])

    return {
      id,
      ...matterResult.data,
      date
    }
  })

  return allPosts.sort((a, b) => {
    return a.date < b.date ? 1 : -1
  })

}