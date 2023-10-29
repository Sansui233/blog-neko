import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { dateToYMD } from '../date';

export const POST_DIR = path.join(process.cwd(), 'source', 'posts')
const CATEGORY_ALL = 'All Posts'
const TAG_UNTAGGED = 'Untagged'


/**
 * parsed by gray-matter, not mdxResource
 */
export type FrontMatter = {
  title: string,
  date: Date,
  category: string,
  tags: string | string[],
  description?: string | string[],
  keywords?: string
}

/**
 * posts database
 * 构造函数返回一个 posts_db 对象
 */
export const posts_db = await (async function () {

  console.log("[posts.ts] collecting posts data...")

  /*
  * source file names
  */
  const names = await ((async () => {
    let fileNames = await fs.promises.readdir(POST_DIR);
    fileNames = fileNames.filter(f => {
      return f.endsWith(".md") || f.endsWith(".mdx")
    })
    return fileNames
  })())

  /**
   * used in url
   */
  const ids = function () {
    return names.map(f => {
      return {
        params: {
          id: f.replace(/\.mdx?$/, '').replaceAll(" ", "-")
        }
      };
    });
  }

  const categories = async function () {
    const categories = new Map<string, number>()
    const p = names
    categories.set(CATEGORY_ALL, p.length)

    const promises = p.map(async fileName => {
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

  /**
   * metas sorted by date
   */
  const metas = async function () {
    const promises = names.map(async fileName => {
      const id = fileName.replace(/\.mdx?$/, '')
      const frontMatter = ((await getFrontMatter(fileName)).data) as FrontMatter
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

  const tags = async function () {
    const tags = new Map<string, number>()
    tags.set(TAG_UNTAGGED, 0)

    const promises = names.map(async fileName => {
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
 * return posts in tag t, sorted by date
 */
  const inTag = async function (t: string) {

    const p: { id: string, title: string, date: Date }[] = []
    const promises = names.map(async fileName => {
      const matterResult = await getFrontMatter(fileName)
      let fileTags = matterResult.data['tags']
      fileTags = typeof (fileTags) === 'string' ? [fileTags] : fileTags
      if (fileTags.some((ft: string) => ft === t)) {
        p.push({
          id: fileName.replace(/\.mdx?$/, ''),
          title: matterResult.data['title'],
          date: matterResult.data['date']
        })
      }
    })

    await Promise.all(promises)

    return p.sort((a, b) => a.date < b.date ? 1 : -1)
  }

  /**
 * return posts in category c, sorted by date
 */
  const inCategory = async function (c: string) {
    const p: { id: string, title: string, date: Date }[] = []
    const promises = names.map(async fileName => {
      const matterResult = await getFrontMatter(fileName)
      if (c === CATEGORY_ALL ||
        (matterResult.data['categories'] && matterResult.data['categories'] === c)
      ) {
        p.push({
          id: fileName.replace(/\.mdx?$/, ''),
          title: matterResult.data['title'],
          date: matterResult.data['date']
        })
      }
    })

    await Promise.all(promises)

    return p.sort((a, b) => a.date < b.date ? 1 : -1)
  }

  return {
    names,
    ids,
    categories,
    metas,
    tags,
    inTag,
    inCategory
  }
})()



/**
 * Get front matter info from a local markdown file
 */
export async function getFrontMatter(fileName: string, dir = POST_DIR) {
  const fullPath = path.join(dir, fileName)
  const fileContents = await fs.promises.readFile(fullPath, 'utf8')
  return matter(fileContents)
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