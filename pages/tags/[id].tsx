import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { CommonHeader, MainLayoutStyle } from "..";
import Layout from "../../components/Layout";
import { dateToYMD } from "../../utils/date";
import { getAllTags, getSortedTagPosts } from "../../utils/posts";
import { Title } from "../categories";
import { TLSectionStyle, TLYearStyle, TLPostsContainer, TLDateStyle } from "../categories/[id]";

type Props = {
  tag: string,
  posts: {
    [year: string]: {
      id: string;
      title: string;
      date: string;
    }[];
  }
}

export default function TagPage({ tag, posts }: Props) {
  return (<>
    <Head>
      <title>Tag - {tag}</title>
      <CommonHeader />
    </Head>
    <Layout>
      <MainLayoutStyle>
        <Title>
          <Link href="/categories">TAG</Link>
          <h1>{tag}</h1>
        </Title>
        {Object.keys(posts).sort((a, b) => a < b ? 1 : -1).map(year => {
          return (
            <TLSectionStyle key={year}>
              <TLYearStyle>{year}</TLYearStyle>
              <TLPostsContainer>
                {posts[year].map(p => {
                  return (<li key={p.id}>
                    <Link href={`/posts/${p.id}`}>{p.title}</Link>
                    <TLDateStyle>{p.date.slice(5)}</TLDateStyle>
                  </li>)
                })}
              </TLPostsContainer>
            </TLSectionStyle>
          )
        })}
      </MainLayoutStyle>

    </Layout>
  </>)
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Array.from(getAllTags()).map(v => {
    return { params: { id: v[0] } }
  })
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  let tag = params!.id as string
  const posts = getSortedTagPosts(tag)

  // Convert to timeline tree
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

  return {
    props: {
      tag: tag,
      posts: Object.fromEntries(postsTree)
    }
  }
}