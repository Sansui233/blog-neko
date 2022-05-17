import fs from 'fs'
import path from 'path';
import matter from 'gray-matter'
import { dateToYMD } from './date';

export const POSTDIR = path.join(process.cwd(), 'source', 'posts')

const postsFileNames = (() => {
  let fileNames = fs.readdirSync(POSTDIR);
  fileNames = fileNames.filter(f => {
    return f.endsWith(".md") || f.endsWith(".mdx")
  })
  return fileNames
})()

function getFrontMatter(fileName: string) {
  const fullPath = path.join(POSTDIR, fileName)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  return matter(fileContents)
}

/**
 * used in post dynamic routes generation
 * @returns 
 */
export function getAllPostIds() {
  return postsFileNames.map(f => {
    return {
      params: {
        id: f.replace(/\.mdx?$/, '')
      }
    }
  })
}


export function getSortedPostsMeta() {
  const allPosts = postsFileNames.map(fileName => {
    const id = fileName.replace(/\.mdx?$/, '')
    const matterResult = getFrontMatter(fileName)
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

const CATEGORY_ALL = 'All Posts'

export function getAllCategories() {
  const categories = new Map<string, number>()
  const posts = postsFileNames // 取出防止重复计算
  categories.set(CATEGORY_ALL, posts.length)

  posts.map(fileName => {
    const matterResult = getFrontMatter(fileName)
    if (matterResult.data['categories']) {
      const c = matterResult.data['categories']
      if (categories.has(c)) {
        categories.set(c, categories.get(c)! + 1)
      } else {
        categories.set(c, 1)
      }
    }
  })
  return categories
}

export function getSortedCategoryPosts(c: string) {
  const posts: {
    id: string,
    title: string,
    date: Date,
  }[] = []

  postsFileNames.map(fileName => {
    const matterResult = getFrontMatter(fileName)
    if (c === CATEGORY_ALL ||
      (matterResult.data['categories'] && matterResult.data['categories'] === c)
    ) {
      posts.push({
        id: fileName.replace(/\.mdx?$/, ''),
        title: matterResult.data['title'],
        date: matterResult.data['date']
      })
    }
  })

  return posts.sort((a, b) => a.date < b.date ? 1 : -1)
}

export function getSortedTagPosts(t: string) {
  const posts: {
    id: string,
    title: string,
    date: Date,
  }[] = []

  postsFileNames.map(fileName => {
    const matterResult = getFrontMatter(fileName)
    let fileTags = matterResult.data['tags']
    fileTags = typeof (fileTags) === 'string' ? [fileTags] : fileTags
    if (fileTags.some((ft: string) => ft === t)) {
      posts.push({
        id: fileName.replace(/\.mdx?$/, ''),
        title: matterResult.data['title'],
        date: matterResult.data['date']
      })
    }
  })

  return posts.sort((a, b) => a.date < b.date ? 1 : -1)
}

const TAG_UNTAGGED = 'Untagged'

export function getAllTags() {
  const tags = new Map<string, number>()
  tags.set(TAG_UNTAGGED, 0)

  postsFileNames.map(fileName => {
    const matterResult = getFrontMatter(fileName)
    if (matterResult.data['tags']) {
      let fileTags = matterResult.data['tags']
      fileTags = typeof (fileTags) === 'string' ? [fileTags] : fileTags
      fileTags.forEach((t: string) => {
        if (tags.has(t)) {
          tags.set(t, tags.get(t)! + 1)
        } else {
          tags.set(t, 1)
        }
      })
    } else {
      tags.set(TAG_UNTAGGED, tags.get(TAG_UNTAGGED)! + 1)
    }
  })
  return tags
}