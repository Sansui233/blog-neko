import { readFile } from "fs/promises"
import matter from "gray-matter"
import { Eye, Folder } from "lucide-react"
import { GetStaticPaths, GetStaticProps } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import path from "path"
import { CSSProperties, useCallback, useMemo } from "react"
import styled from "styled-components"
import { CommonHead } from ".."
import Pagination from "../../components/common/pagination"
import LayoutContainer from "../../components/layout"
import { useMdxPost } from "../../components/mdx"
import { PostMeta } from '../../lib/data/posts.common'
import { POST_DIR, posts_db } from "../../lib/data/server"
import { grayMatter2PostMeta } from "../../lib/markdown/frontmatter"
import { compileMdxPost } from "../../lib/markdown/mdx"
import { useScrollTop } from "../../lib/use-view"
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

export default function Post({ meta, mdxcode, nextPost, prevPost, excerpt, headings }: Props) {

  const router = useRouter()
  const scrollTop = useScrollTop()

  const description = meta.description ?
    (meta.description as string).concat(excerpt)
    : excerpt

  const genTags = useCallback((tagList: Array<string>) => {
    return <>
      {tagList.map((tag: string) => {
        return (
          <StyledLink href={`/tags/${tag}`} passHref={true} key={tag}>
            #{tag}&nbsp;
          </StyledLink>
        );
      })}
    </>;
  }, [])

  // use tags and keywords in frontmatter as keywords in <meta>
  const getKeywords = useCallback((fm: Record<string, unknown>) => {
    const tagList = typeof (fm.tags) === "string" ? [fm.tags] : (fm.tags) as Array<string>
    if (fm.keywords !== null && typeof (fm.keywords) === "string") {
      return tagList.join().concat(', ').concat(fm.keywords.replaceAll('，', ', '))
    } else {
      return tagList.join()
    }
  }, [])

  const scrollToTarget = useCallback((event: React.MouseEvent<HTMLElement>, targetId: string) => {
    event.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const boundingClientRect = targetElement.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const offset = 63;

      window.scrollTo({
        top: boundingClientRect.top + scrollY - offset,
        behavior: 'smooth',
      });
    }
  }, []);

  const fixedStyle: CSSProperties = useMemo(() => {
    return scrollTop > 100 ? {
      top: "63px",
    } : {}
  }, [scrollTop])

  return <>
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={description}></meta>
      <meta name="keywords" content={getKeywords(meta)}></meta>
      <CommonHead />
    </Head>
    <LayoutContainer>
      <PostLayout>
        <PostTitle>
          <h1>{meta.title}</h1>
          <MetaStyle>
            <span className="date">{meta.date}</span>
            <div className="tag">
              {genTags(meta.tags)}
              {"收录于"}
              <StyledLink href={`/categories/${meta.categories}`} passHref={true}>
                <Folder size={"1.1em"} style={{ margin: "0 0.2rem", paddingBottom: "0.1em" }} />
                {meta.categories}
              </StyledLink>
            </div>
            <div className="view">
              <Eye size={"1.1em"} style={{ margin: "0 0.2rem", paddingBottom: "0.1em" }} />
              <span className="waline-pageview-count" data-path={router.basePath} />
            </div>
          </MetaStyle>
        </PostTitle>
        <MarkdownStyle>
          {useMdxPost(mdxcode)}
        </MarkdownStyle>
        <div style={{ textAlign: 'right', opacity: .5, fontSize: '0.875rem', margin: "4rem 0 2rem 0" }}>
          更新于 {meta.date}
        </div>
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
              ? headings.map((h) => {
                return <TocAnchor $rank={h.rank} href={`#${h.id}`} onClick={(e) => { scrollToTarget(e, h.id) }} key={h.id}>
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

const ColumnRight = styled.div`
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

const PostTitle = styled.div`
  text-align: center;

  h1 {
    max-width: 12em;
    margin: 0 auto;
  }

  @media screen and (max-width: 580px){
    margin-bottom: 2rem;
  }
`

const MetaStyle = styled.span`
  color: ${p => p.theme.colors.textGray};

  .date {
    font-size: 1rem;
    display: inline-block;
    color: ${p => p.theme.colors.textPrimary};
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  .tag {
    font-size: 0.875rem;
  }

  .view {
    text-align: right;
    font-size: 0.8rem;
    margin: 1rem 0;
  }
`

const StyledLink = styled(Link)`
  transition: opacity .3s, color .3s;
  color: ${p => p.theme.colors.textPrimary};

  &:hover {
    color: ${p => p.theme.colors.accent};
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
`