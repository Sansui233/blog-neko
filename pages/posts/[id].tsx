import { readFile } from "fs/promises"
import matter from "gray-matter"
import { ArrowUpToLine, Eye, Folder, MenuSquare, TagIcon, X } from "lucide-react"
import { GetStaticPaths, GetStaticProps } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import path from "path"
import { useCallback, useEffect, useMemo, useState } from "react"
import styled from "styled-components"
import { CommonHead } from ".."
import ButtonFloat from "../../components/common/button-float"
import Pagination from "../../components/common/pagination"
import LayoutContainer from "../../components/layout"
import { useMdxPost } from "../../components/mdx"
import { MarkdownStyle } from "../../components/styled/markdown-style"
import { PostMeta } from '../../lib/data/posts.common'
import { POST_DIR, posts_db } from "../../lib/data/server"
import { dateI18n, parseDate } from "../../lib/date"
import { grayMatter2PostMeta } from "../../lib/markdown/frontmatter"
import { compileMdxPost } from "../../lib/markdown/mdx"
import { throttle } from "../../lib/throttle"
import { useDocumentEvent } from "../../lib/use-event"
import { fadeInRight } from "../../styles/animations"
import { floatMenu } from "../../styles/css"

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
  const [isMobileSider, setIsMobileSider] = useState(false)

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
      if (scrollY > 300) {
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


  const isFixedTop = useMemo(() => isViewing && !isMobileSider, [isViewing, isMobileSider])

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
        <Date>{dateI18n(parseDate(meta.date), "day", "dateMDY")}</Date>
        <MetaStyle>
          <div style={{ display: "inline-block", maxWidth: "50%" }}>
            <span className="category">
              <StyledLink href={`/categories/${meta.categories}`} passHref={true}>
                <Folder size={"1.1em"} style={{ marginLeft: "0.5em", marginRight: "0.15em", paddingBottom: "0.1em" }} />
                {meta.categories}
              </StyledLink>
            </span>
            {meta.tags.length !== 0 && <span className="tag">{tags}</span>}
          </div>
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
        <ButtonFloat
          className="toc-btn"
          Icon={MenuSquare}
          clickHandler={(e) => { e.stopPropagation(); setIsMobileSider(v => !v) }}
          style={{ bottom: "5rem" }}
        />
        {isViewing && <ButtonFloat
          Icon={ArrowUpToLine}
          clickHandler={(e) => { e.stopPropagation(); window.scrollTo({ top: 0 }) }}
        />}
      </PostLayout>
      <ColumnRightContainer $isMobileSider={isMobileSider} $isFixedTop={isFixedTop}>
        <div className="close-btn" onClick={(e) => { e.stopPropagation(); setIsMobileSider(v => !v) }}>
          <X size={"1.25em"} style={{ marginLeft: ".5rem" }} />
        </div>
        <ColumnRightContent>
          <Toc>
            <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
              目录
            </div>
            <TocContent>
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
                : <span style={{ opacity: "0.6", fontSize: "0.875rem", }}>这是一篇没有目录的文章。</span>}
            </TocContent>
          </Toc>
        </ColumnRightContent>
      </ColumnRightContainer>
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

  .toc-btn {
    display: none;
  }

  @media screen and (max-width: 1400px){
    width: 52%;
  }

  @media screen and (max-width: 1200px){
    width: 75%;
    padding-left: 80px;
    margin: unset;
  }

  @media screen and (max-width: 1000px){
    width: 85%;
    margin: 0 auto;
    padding-left: 20px;
    .toc-btn {
      display: unset;
    }
  }

  @media screen and (max-width: 580px) {
    padding: 48px 20px;
    width: 100%;
  }
`

const ColumnRightContent = styled.section`
`

const ColumnRightContainer = styled.aside<{
  $isMobileSider: boolean,
  $isFixedTop: boolean
}>`
  position: fixed;
  top: ${p => p.$isFixedTop ? "63px" : "128px"};
  animation: ${fadeInRight} 0.3s ease;
  will-change: transform;
  transition: top 0.3s ease;

  max-width: 18rem;
  max-height: ${p => p.$isFixedTop ? "calc(100vh - 63px)" : "calc(100vh - 128px)"};
  padding: 0 1rem;
  line-height: 1.75rem; /* 与正文同 line-height */
  overflow: auto;

  left: 78%;
  width: 22%;

  .close-btn {
    display:none;
    z-index: 1;
  }

  @media screen and (max-width: 1200px){
    left: 76%;
    width: 24%;
  }

  @media screen and (max-width: 1000px) {
    top: unset;
    left: unset;
    bottom: 9rem;
    animation: unset;

    ${floatMenu}
    max-height: calc(100vh - 128px - 9rem);
    width:250px;
    padding-top: 1rem;
    padding-bottom: 1rem;
    
    right: 7px;
    transition: opacity .3s ease;
    opacity: ${p => p.$isMobileSider ? `1` : `0`};
    ${p => p.$isMobileSider ? null : `pointer-events: none;`};


    .close-btn {
      position: sticky;
      float: right;
      top: 0;

      display: flex;
      font-weight: 600;
      justify-content: space-between;
      align-items: center;

      ${p => p.$isMobileSider ? null : `visibility:hidden;`}
      color: ${p => p.theme.colors.textGray2};
      font-size: 1rem;
      cursor:pointer;
    }
    .close-btn:hover{
      color: ${p => p.theme.colors.accent};
    }
  }

  @media screen and (max-width: 580px) {
    right: 2%;
    bottom: 0;
    max-height: unset;
    height: 60vh;
    max-width: unset;
    opacity: unset;
    width: 96%;
    transition: transform .3s ease;
    transform: ${p => p.$isMobileSider ? `translateY(0%)` : `translateY(100%)`};
  }

`


const PostTitle = styled.h1`
margin-top: 0;
margin-bottom: 0;
text-align: center;
`

const Date = styled.div`
  color:${props => props.theme.colors.textGray2};
  font-weight: 600;
  margin-top: 1rem;
  font-size: 0.875rem;
  text-align: center;
`

const MetaStyle = styled.div`
  margin-top: 1rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;

  /*border-bottom: 2px dotted ${props => props.theme.colors.uiLineGray};*/

  .category {
    font-size: 0.875rem;
    line-height: 1.5rem;
    padding-right: 0.5rem;
  }

  .tag {
    font-size: 0.875rem;
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
  background: ${p => p.theme.colors.tagBg};
  color: ${p => p.theme.colors.textSecondary};
  display: inline-block;
  padding: 0.3em 0.5em;
  margin: 1px;
  border-radius: 2em;

  svg {
    margin-right: 3px;
  }
  &:hover {
    background: ${p => p.theme.colors.accentHover};
  }
`

const Toc = styled.nav`
  border-radius: 0.75rem;
`

const TocContent = styled.div`
  position: relative;
`

const TocAnchor = styled(Link) <{ $rank: number }>`
  display: block;
  padding-left: ${p => p.$rank}em;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  line-height: 2rem;

  &::before {
    content: "•";
    color: ${p => p.theme.colors.accentHover};
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
    color: ${props => props.theme.colors.textPrimary};
    &::before {
      color: ${p => p.theme.colors.accent};
    }
  }
`