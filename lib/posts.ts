import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { dateToYMD } from './date';

export const POST_DIR = path.join(process.cwd(), 'source', 'posts')
const CATEGORY_ALL = 'All Posts'
const TAG_UNTAGGED = 'Untagged'

type FrontMatter = {
  title?: string,
  date?: Date,
  category?: string,
  tags?: string | string[],
  description?: string | string[],
}

/**
 * 获取要处理的文件名
 */
const fileNames = await ((async () => {
  let fileNames = await fs.promises.readdir(POST_DIR);
  fileNames = fileNames.filter(f => {
    return f.endsWith(".md") || f.endsWith(".mdx")
  })
  return fileNames
})())

/**
 * Get front matter info from a local markdown file
 */
export async function getFrontMatter(fileName: string, dir = POST_DIR) {
  const fullPath = path.join(dir, fileName)
  const fileContents = await fs.promises.readFile(fullPath, 'utf8')
  return matter(fileContents)
}

/**
 * Get ids of all posts. Id is used in post url
 */
export async function getAllPostIds() {
  return fileNames.map(f => {
    return {
      params: {
        id: f.replace(/\.mdx?$/, '').replaceAll(" ", "-")
      }
    };
  });
}

export async function getSortedPostsMeta() {
  const promises = fileNames.map(async fileName => {
    const id = fileName.replace(/\.mdx?$/, '')
    const frontMatter: FrontMatter = (await getFrontMatter(fileName)).data
    const date = dateToYMD(frontMatter.date!)

    return {
      id,
      ...frontMatter,
      date
    }
  })

  const allPosts = await Promise.all(promises)

  return allPosts.sort((a, b) => {
    return a.date < b.date ? 1 : -1
  })
}

export async function getAllCategories() {
  const categories = new Map<string, number>()
  const posts = fileNames // 取出防止重复计算
  categories.set(CATEGORY_ALL, posts.length)

  const promises = posts.map(async fileName => {
    const matterResult = await getFrontMatter(fileName)
    if (matterResult.data['categories']) {
      const c = matterResult.data['categories']
      if (categories.has(c)) {
        categories.set(c, categories.get(c)! + 1)
      } else {
        categories.set(c, 1)
      }
    }
  })

  await Promise.all(promises)

  return categories
}

export async function getPostsMetaInCategory(c: string) {
  const posts: {
    id: string,
    title: string,
    date: Date,
  }[] = []

  const promises = fileNames.map(async fileName => {
    const matterResult = await getFrontMatter(fileName)
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

  await Promise.all(promises)

  return posts.sort((a, b) => a.date < b.date ? 1 : -1)
}

export async function getSortedTagPosts(t: string) {
  const posts: {
    id: string,
    title: string,
    date: Date,
  }[] = []

  const promises = fileNames.map(async  fileName => {
    const matterResult = await getFrontMatter(fileName)
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

  await Promise.all(promises)

  return posts.sort((a, b) => a.date < b.date ? 1 : -1)
}

export async function getAllTags() {
  const tags = new Map<string, number>()
  tags.set(TAG_UNTAGGED, 0)

  const promises = fileNames.map(async fileName => {
    const matterResult = await getFrontMatter(fileName)
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

  await Promise.all(promises)
  
  return tags
}

/**
 * Group posts data by year in an Object
 */
export function groupByYear(posts: {
  id: string,
  title: string,
  date: Date,
}[]): {
  [year: string]: {
    id: string;
    title: string;
    date: string;
  }[];
} {
  const postsTree = new Map<number, { id: string, title: string, date: string }[]>() //<year,post[]>
  posts.forEach(p => {
    const y = p.date.getFullYear()
    if (postsTree.has(y)) {
      postsTree.get(y)!.push({
        id: p.id,
        title: p.title,
        date: dateToYMD(p.date)
      })
    } else {
      postsTree.set(y, [{
        id: p.id,
        title: p.title,
        date: dateToYMD(p.date)
      }])
    }
  })

  return Object.fromEntries(postsTree)
}