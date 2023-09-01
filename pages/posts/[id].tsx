import { readFile } from "fs/promises"
import { GetStaticPaths, GetStaticProps } from "next"
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import path from "path"
import { useContext } from "react"
import remarkGfm from "remark-gfm"
import styled, { ThemeContext } from "styled-components"
import { CommonHeader, MainLayoutStyle } from ".."
import Layout from "../../components/Layout"
import Pagination from "../../components/Pagination"
import Waline from "../../components/Waline"
import { dateToYMD } from "../../lib/date"
import { POST_DIR, posts } from "../../lib/posts"
import { rehypeAddAnchors, rehypeExtractHeadings } from "../../lib/rehype-toc"
import { bottomFadeIn, fadeInRight } from "../../styles/animations"
import { MarkdownStyle } from "../../styles/markdown"

type Props = {
  mdxSource: MDXRemoteSerializeResult,
  excerpt: string,
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

export default function Post({ mdxSource, nextPost, prevPost, excerpt, headings }: Props) {

  const router = useRouter()
  const theme = useContext(ThemeContext)
  const frontmatter = mdxSource.frontmatter! as any
  const source = mdxSource.compiledSource

  const description = frontmatter.description ?
    (frontmatter.description as string).concat(excerpt)
    : excerpt

  function genTags(tags: string | Array<string>) {
    const tagList = typeof (tags) === "string" ? [tags] : tags
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
  function getKeywords(fm: any) {
    const tagList = typeof (fm.tags) === "string" ? [fm.tags] : fm.tags
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
      <title>{frontmatter.title}</title>
      <meta name="description" content={description}></meta>
      <meta name="keywords" content={getKeywords(frontmatter)}></meta>
      <CommonHeader />
    </Head>
    <Layout>
      <div style={{ display: "flex", margin: "auto" }}>
        <div style={{ flex: " 2 1 0" }}>
          <PostLayout >
            <PostTitle>
              <h1>{frontmatter.title}</h1>
              <div style={{ display: "flex" }}>
                <div style={{ flex: "1 1 0" }}>
                  <MetaStyle style={{ flex: "1 1 0" }}>
                    {frontmatter.date}
                    {" | "}
                    {genTags(frontmatter.tags)}
                    {" in "}
                    <StyledLink href={`/categories/${frontmatter.categories}`} passHref={true}>
                      <i style={{ paddingRight: "0.15em" }} className='icon-material-folder_open' />
                      {frontmatter.categories}
                    </StyledLink>
                  </MetaStyle>
                </div>
                <div style={{ flex: "0 0 0" }}>
                  <i style={{ paddingLeft: "0.5em", paddingRight: "0.3em" }} className='icon-material-eye' />
                  <span className="waline-pageview-count" data-path={router.basePath} />
                </div>
              </div>
            </PostTitle>
            <MarkdownStyle>
              <MDXRemote compiledSource={source} scope={null} frontmatter={null} />
            </MarkdownStyle>
            <div style={{ textAlign: 'right', opacity: .5, fontSize: '0.875rem', margin: "4rem 0 2rem 0" }}>
              更新于 {frontmatter.date}
            </div>
            <Pagination
              nextPage={nextPost ? nextPost : undefined}
              prevPage={prevPost ? prevPost : undefined}
            />
            <Waline />
          </PostLayout>
        </div>
        <ColumnRight>
          <nav>
            <div style={{ fontSize: "1.25rem", fontWeight: "bold", paddingBottom: "0.5rem", marginBottom: "0.5rem", borderBottom: `solid 1px ${theme?.colors.gold}` }}>
              目录
            </div>
            {headings.map((h) => {
              return <TocAnchor $rank={h.rank} href={`#${h.id}`} onClick={(e) => { scrollToTarget(e, h.id) }} key={h.id}>
                <span>{h.title}</span>
              </TocAnchor>
            })}
          </nav>
        </ColumnRight>
      </div>
    </Layout>
  </>;
}


// ALL POSTS Dynamic Route 決定
export const getStaticPaths: GetStaticPaths = async () => {
  // return all [id]
  const paths = posts.ids();
  return {
    paths,
    fallback: false
  }
}

// get POST Data
export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const id = params!.id as string
  const mdContent = await readFile(path.join(POST_DIR, `${id}.md`), 'utf-8') // TODO 没有处理mdx的后缀

  // 获取摘要，分割YAML头和Markdown正文
  const yamlSeparator = '---\r\n';
  let sepIndex = mdContent.indexOf('---\n', 5)
  if (sepIndex === -1) {
    sepIndex = mdContent.indexOf('---\r\n', 5)
  }
  const mdBodyStart = mdContent.substring(sepIndex + yamlSeparator.length + 1); // Start at 5 to skip the first seperator
  const excerpt = mdBodyStart.replace(/\n/g, ' ').substring(0, 144);

  // Process Content
  let headings: any[] = []
  const mdxSource = await serialize(
    mdContent,
    {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [rehypeAddAnchors, { rank: [1, 2, 3] }],
          [rehypeExtractHeadings, { rank: [1, 2, 3], headings }],
        ],
        format: 'mdx',
      },
      parseFrontmatter: true
    })

  // normalize heading rank
  if (headings.length > 0) {
    const minRank = Math.min(...headings.map(heading => heading.rank));
    const offset = minRank - 1;
    headings = headings.map(heading => ({
      ...heading,
      rank: heading.rank - offset
    }));
  }

  // Process Date
  const fm = mdxSource.frontmatter! as any
  if (fm["date"]) {
    fm["date"] = dateToYMD(fm["date"])
  }

  // Get next and prev Post
  const allPosts = await posts.metas()
  const i = allPosts.findIndex(p => p.id === id)
  const prevPost = i - 1 < 0 ? null : {
    title: allPosts[i - 1].title!,
    link: `/posts/${allPosts[i - 1].id!}`
  }
  const nextPost = i + 1 > allPosts.length - 1 ? null : {
    title: allPosts[i + 1].title!,
    link: `/posts/${allPosts[i + 1].id!}`
  }

  return {
    props: {
      mdxSource,
      prevPost: prevPost,
      nextPost: nextPost,
      excerpt,
      headings
    }
  }
}

const PostLayout = styled(MainLayoutStyle)`
  max-width: 750px;
  margin-top: 72px;
  animation: ${bottomFadeIn} 1s ease;
`

const ColumnRight = styled.div`
  max-width: 15em;
  flex: 1 1 0;
  margin-top: calc(1.375*1em + 72px);
  position: sticky;
  align-self: flex-start;
  top: 63px;

  animation: ${fadeInRight} 1s ease;

  @media screen and (max-width: 780px) {
    max-width: 10em;
  }
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

  &::before {
    content:'';
    position: absolute;
    top: -.8em;
    left: 0;
    height: 1px;
    width: 100%;
    background: ${p => p.theme.colors.gold};
  }
  // border-top: 1px solid;
`

const StyledLink = styled(Link)`
  transition: opacity .3s, color .3s;

  &:hover {
    color: ${p => p.theme.colors.gold};
  }

`

const TocAnchor = styled(Link) <{ $rank: number }>`
  display: block;
  padding-left: ${p => p.$rank - 1}em;
  line-height: 1.8em;

  & span {
    transition: box-shadow .5s;
  }

  &:hover span {
    box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.goldHover};
  }

`