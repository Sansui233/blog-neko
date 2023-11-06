import { readFile } from "fs/promises"
import matter from "gray-matter"
import { GetStaticPaths, GetStaticProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import path from "path"
import { useContext } from "react"
import styled, { ThemeContext } from "styled-components"
import { CommonHead } from ".."
import Pagination from "../../components/common/Pagination"
import Waline from "../../components/common/Waline"
import LayoutContainer, { OneColLayout } from "../../components/layout"
import { useMdxPost } from "../../components/mdx"
import { POST_DIR, posts_db } from "../../lib/data/posts"
import { PostMeta } from '../../lib/data/posts.common'
import { grayMatter2PostMeta } from "../../lib/markdown/frontmatter"
import { compileMdxPost } from "../../lib/markdown/mdx"
import { bottomFadeIn, fadeInRight } from "../../styles/animations"
import { MarkdownStyle } from "../../styles/components/MarkdownStyle"

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
  const theme = useContext(ThemeContext)

  const description = meta.description ?
    (meta.description as string).concat(excerpt)
    : excerpt

  function genTags(tagList: Array<string>) {
    return <>
      {tagList.map((tag: string) => {
        return (
          <StyledLink href={`/tags/${tag}`} passHref={true} key={tag}>
            {`#${tag} `}
          </StyledLink>
        );
      })}
    </>;
  }

  // use tags and keywords in frontmatter as keywords in <meta>
  function getKeywords(fm: Record<string, unknown>) {
    const tagList = typeof (fm.tags) === "string" ? [fm.tags] : (fm.tags) as Array<string>
    if (fm.keywords !== null && typeof (fm.keywords) === "string") {
      return tagList.join().concat(', ').concat(fm.keywords.replaceAll('，', ', '))
    } else {
      return tagList.join()
    }
  }

  const scrollToTarget = (event: React.MouseEvent<HTMLElement>, targetId: string) => {
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
  };

  return <>
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={description}></meta>
      <meta name="keywords" content={getKeywords(meta)}></meta>
      <CommonHead />
    </Head>
    <LayoutContainer>
      <div style={{ display: "flex", margin: "auto" }}>
        <ColumnLeft>
          <div className="blank-spacer-left" />
          <PostLayout>
            <PostTitle>
              <h1>{meta.title}</h1>
              <div style={{ display: "flex" }}>
                <div style={{ flex: "1 1 0" }}>
                  <MetaStyle style={{ flex: "1 1 0" }}>
                    <span className="date">{meta.date}</span>
                    {" | "}
                    {genTags(meta.tags)}
                    {" in "}
                    <StyledLink href={`/categories/${meta.categories}`} passHref={true}>
                      <i style={{ paddingRight: "0.15em" }} className='icon-material-folder_open' />
                      {meta.categories}
                    </StyledLink>
                  </MetaStyle>
                </div>
                <div style={{ flex: "0 0 0", fontSize: "0.875rem" }}>
                  <i style={{ paddingLeft: "0.5em", paddingRight: "0.3em" }} className='icon-material-eye' />
                  <span className="waline-pageview-count" data-path={router.basePath} />
                </div>
              </div>
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
          <div className="blank-spacer-right" />
        </ColumnLeft>
        <ColumnRight>
          <nav>
            <div style={{ fontSize: "1.25rem", fontWeight: "bold", paddingBottom: "0.5rem", marginBottom: "0.5rem", borderBottom: `solid 1px ${theme?.colors.gold}` }}>
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
          </nav>
        </ColumnRight>
      </div>
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

const PostLayout = styled(OneColLayout)`
  max-width: min(700px, 100vw);
  margin-top: 72px;
  animation: ${bottomFadeIn} 1s ease;

  @media screen and (max-width: 580px) {
    margin-top: 36px;
  }
`
const ColumnLeft = styled.div`
  width: 0;
  flex: 2 1 0;
  display: flex;

  & .blank-spacer-left {
    @media screen and (min-width: 1080px) {
      flex: 2 1 0;
    }
  }

  & .blank-spacer-right {
    @media screen and (min-width: 780px) {
      flex: 1 1 0;
    }
  }
`

const ColumnRight = styled.div`
  max-width: min(18em,20vw);
  flex: 1 1 0;
  margin-top: 94px;
  position: sticky;
  align-self: flex-start;
  top: 63px;

  animation: ${fadeInRight} 1s ease;

  @media screen and (max-width: 580px) {
    display: none
  }
`

const PostTitle = styled.div`
  margin-bottom: 3rem;
  h1 {
    margin-top: .3rem;
    margin-bottom: 0.5rem;
  }
`

const MetaStyle = styled.span`
  font-size: 0.875rem;
  position: relative;

  .date {
    font-family: Dosis;
    font-size: 0.95rem;
  }

  &::before {
    content:'';
    position: absolute;
    top: -.8em;
    left: 0;
    height: 1px;
    width: 100%;
    background: ${p => p.theme.colors.gold};
  }
`

const StyledLink = styled(Link)`
  transition: opacity .3s, color .3s;

  &:hover {
    color: ${p => p.theme.colors.gold};
  }

`

const TocAnchor = styled(Link) <{ $rank: number }>`
  display: block;
  padding-left: ${p => p.$rank}em;
  padding-top: 0.1em;
  padding-bottom: 0.1em;
  line-height: 1.8em;

  &::before {
    content: "•";
    color: ${p => p.theme.colors.gold};
    left: ${p => p.$rank - 1}em;
    position: absolute;
  }

  & span {
    transition: box-shadow .5s;
  }

  &:hover span {
    box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.goldHover};
  }
`

const HeadingContainer = styled.div`
  position: relative;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
`