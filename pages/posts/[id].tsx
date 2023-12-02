import { readFile } from "fs/promises"
import matter from "gray-matter"
import { Eye, Folder, TagIcon } from "lucide-react"
import { GetStaticPaths, GetStaticProps } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import path from "path"
import { CSSProperties, useCallback, useEffect, useMemo, useState } from "react"
import styled from "styled-components"
import { CommonHead } from ".."
import Pagination from "../../components/common/pagination"
import LayoutContainer from "../../components/layout"
import { useMdxPost } from "../../components/mdx"
import { PostMeta } from '../../lib/data/posts.common'
import { POST_DIR, posts_db } from "../../lib/data/server"
import { grayMatter2PostMeta } from "../../lib/markdown/frontmatter"
import { compileMdxPost } from "../../lib/markdown/mdx"
import { throttle } from "../../lib/throttle"
import { useDocumentEvent } from "../../lib/use-event"
import { fadeInRight } from "../../styles/animations"
import { MarkdownStyle } from "../../styles/components/markdown-style"

const Waline = dynamic(() => import("../../components/common/waline"))

type Props = {
  meta: PostMeta,
  excerpt: string,
  mdxcode: string,
  nextPost?: {
    title: string,
    link: string,
  } | null, // 由于 undefined 不能被序列化无奈加了 null
  prevPost?: {
    title: string,
    link: string,
  } | null,
  headings: Array<PropHeading>
}

type PropHeading = {
  title: string,
  rank: number,
  id: string
}

const scrollOffset = 93;

export default function Post({ meta, mdxcode, nextPost, prevPost, excerpt, headings }: Props) {

  const router = useRouter()
  const [isViewing, setIsViewing] = useState(false)
  const [headingsY, setHeadingsY] = useState<(number | undefined)[]>([])
  const [currentHeading, setCurrentHeading] = useState(-1)

  useEffect(() => {
    const y = headings.map(h => {
      const ele = document.getElementById(h.id)
      return ele ? ele.getBoundingClientRect().top + window.scrollY - scrollOffset : undefined
    })
    setHeadingsY(y) // should be updated on window resize but I don't want it to be costy
  }, [headings])

  const scrollHandler = useMemo(() => {
    return throttle(() => {
      const scrollY = globalThis.scrollY
      if (scrollY > 100) {
        setIsViewing(true)
      } else (
        setIsViewing(false)
      )
      const scrollAnchor = scrollY + 20
      for (let i = 0; i < headingsY.length; i++) {
        if (i === 0 && scrollAnchor < headingsY[i]!) { // before first
          setCurrentHeading(-1)
          break
        }
        if (headingsY[i] && i + 1 < headingsY.length && headingsY[i + 1]) { // normal
          if (scrollAnchor >= headingsY[i]! && scrollAnchor < headingsY[i + 1]!) {
            setCurrentHeading(i)
            break
          }
        } else if (headingsY[i] && i + 1 === headingsY.length) { // last
          if (scrollAnchor >= headingsY[i]!) {
            setCurrentHeading(i)
            break
          }
        }
      }
    }, 50)
  }, [headingsY])

  useDocumentEvent("scroll", scrollHandler)

  const scrollTo = useCallback((event: React.MouseEvent<HTMLElement>, index: number) => {
    event.preventDefault();
    if (headingsY[index]) {
      window.scrollTo({
        top: headingsY[index],
        behavior: 'smooth',
      });
    }
  }, [headingsY]);

  const description = useMemo(() => meta.description ?
    (meta.description as string).concat(excerpt)
    : excerpt, [excerpt, meta.description])

  const tags = useMemo(() => (<>
    {meta.tags.map((tag, i) => {
      return (
        <Tag href={`/tags/${tag}`} passHref={true} key={tag}>
          <TagIcon size={"0.875em"} />{tag}
        </Tag>
      );
    })}
  </>), [meta.tags])

  // use tags and keywords in frontmatter as keywords in <meta>
  const getKeywords = useCallback((fm: Record<string, unknown>) => {
    const tagList = typeof (fm.tags) === "string" ? [fm.tags] : (fm.tags) as Array<string>
    if (fm.keywords !== null && typeof (fm.keywords) === "string") {
      return tagList.join().concat(', ').concat(fm.keywords.replaceAll('，', ', '))
    } else {
      return tagList.join()
    }
  }, [])


  const fixedStyle: CSSProperties = useMemo(() => {
    return isViewing ? {
      top: "63px",
    } : {}
  }, [isViewing])

  return <>
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={description}></meta>
      <meta name="keywords" content={getKeywords(meta)}></meta>
      <CommonHead />
    </Head>
    <LayoutContainer>
      <PostLayout>
        <PostTitle>{meta.title}</PostTitle>
        <MetaStyle>
          <div className="date">{meta.date}</div>
          <div className="category">
            {"收录于"}
            <StyledLink href={`/categories/${meta.categories}`} passHref={true}>
              <Folder size={"1.1em"} style={{ margin: "0 3px", paddingBottom: "0.1em" }} />
              {meta.categories}
            </StyledLink>
          </div>
          {meta.tags.length !== 0 && <div className="tag">{tags}</div>}
        </MetaStyle>

        <MarkdownStyle>
          {useMdxPost(mdxcode)}
        </MarkdownStyle>
        <section>
          <div style={{ textAlign: 'right', opacity: .5, fontSize: '0.875rem', margin: "4rem 0 0 0" }}>
            更新于 {meta.date}
          </div>
          <div style={{ textAlign: 'right', opacity: .5, fontSize: '0.875rem' }}>
            <Eye size={"1.1em"} style={{ margin: "0 0.2rem", paddingBottom: "0.1em" }} />
            <span className="waline-pageview-count" data-path={router.basePath} />
          </div>
        </section>
        <Pagination
          nextPage={nextPost ? nextPost : undefined}
          prevPage={prevPost ? prevPost : undefined}
        />
        <Waline />
      </PostLayout>
      <ColumnRight style={fixedStyle}>
        <Toc>
          <div style={{ fontWeight: "bold" }}>
            目录
          </div>
          <HeadingContainer>
            {headings.length > 0
              ? headings.map((h, i) => {
                return <TocAnchor
                  className={currentHeading === i ? "current" : undefined}
                  $rank={h.rank}
                  href={`#${h.id}`}
                  onClick={(e) => { scrollTo(e, i) }}
                  key={h.id}>
                  <span>{h.title}</span>
                </TocAnchor>
              })
              : <span style={{ opacity: "0.6", fontSize: "0.9rem", }}>这是一篇没有目录的文章。</span>}
          </HeadingContainer>
        </Toc>
      </ColumnRight>
    </LayoutContainer>
  </>;
}


// ALL POSTS Dynamic Route 決定
export const getStaticPaths: GetStaticPaths = async () => {
  // return all [id]
  const paths = posts_db.ids();
  return {
    paths,
    fallback: false
  }
}

// get POST Data
export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const id = params!.id as string
  const fullContent = await readFile(path.join(POST_DIR, `${id}.md`), 'utf-8')


  const mattered = matter(fullContent)

  let excerpt = mattered.content.replace(/(\r\n|\n|\r)/g, ' ').substring(0, 144);
  const meta = grayMatter2PostMeta(mattered)



  // Get next and prev Post
  const allPosts = posts_db.metas
  const i = allPosts.findIndex(p => p.id === id)
  const prevPost = i - 1 < 0 ? null : {
    title: allPosts[i - 1].title!,
    link: `/posts/${allPosts[i - 1].id!}`
  }
  const nextPost = i + 1 > allPosts.length - 1 ? null : {
    title: allPosts[i + 1].title!,
    link: `/posts/${allPosts[i + 1].id!}`
  }

  const { code, headings } = await compileMdxPost(mattered.content)

  return {
    props: {
      meta,
      mdxcode: code,
      excerpt,
      prevPost: prevPost,
      nextPost: nextPost,
      headings
    }
  }
}

const PostLayout = styled.article`
  margin-top: 72px;
  margin: 0 auto;
  padding: 60px 20px;
  max-width: 800px;
  width: 56%;

  @media screen and (max-width: 1200px){
    width: 52%;
  }

  @media screen and (max-width: 1000px){
    width: 85%;
    max-width: 700px;
  }

  @media screen and (max-width: 580px) {
    padding: 48px 20px;
    width: 100%;
  }
`

const ColumnRight = styled.aside`
  position: fixed;
  top: 128px;
  animation: ${fadeInRight} 0.3s ease;
  will-change: top;
  transition: top 0.3s ease;

  max-width: 18rem;
  max-height: 80vh;
  padding: 0 1rem;
  line-height: 1.7rem; /* 与正文同 line-height */
  overflow: auto;

  left: 78%;
  width: 22%;

  @media screen and (max-width: 1200px){
    left: 76%;
    width: 24%;
  }

  @media screen and (max-width: 1000px) {
    display: none
  }
`

const PostTitle = styled.h1`
  text-align: center;
  max-width: 12em;
  margin: 0 auto;
`

const MetaStyle = styled.div`
  text-align: center;
  margin-top: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px dotted ${p => p.theme.colors.uiLineGray};
  margin-bottom: 1.5rem;

  .date {
    font-weight: bold;
  }

  .category {
    margin-top: 0.25rem;
    font-size: 0.9rem;
    line-height: 1;
  }

  .tag {
    margin-top: 1rem;
    font-size: 0.9rem;
    line-height: 1;
  }
`

const StyledLink = styled(Link)`
  transition: opacity .3s, color .3s;
  color: ${p => p.theme.colors.textPrimary};

  &:hover {
    color: ${p => p.theme.colors.accent};
  }
`

const Tag = styled(Link)`
  transition: background .3s, color .3s;
  color: ${p => p.theme.colors.textSecondary};
  background: ${p => p.theme.colors.tagBg};
  display: inline-block;
  padding: 0.5rem 0.625rem;
  margin: 0 3px;
  border-radius: 1rem;

  svg {
    margin-right: 3px;
  }
  &:hover {
    background: ${p => p.theme.colors.accentHover};
  }
`

const Toc = styled.nav`
  background: ${p => p.theme.colors.floatBg};
  padding: 1.25rem;
  border-radius: 1rem;
`

const HeadingContainer = styled.div`
  position: relative;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
`

const TocAnchor = styled(Link) <{ $rank: number }>`
  display: block;
  padding-left: ${p => p.$rank}em;

  &::before {
    content: "•";
    color: ${p => p.theme.colors.accent};
    left: ${p => p.$rank - 1}em;
    position: absolute;
  }

  & span {
    transition: box-shadow .5s;
  }

  &:hover span {
    box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.accentHover};
  }

  &.current {
    font-weight: bold;
    span {
      box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.accentHover};
    }
  }
`