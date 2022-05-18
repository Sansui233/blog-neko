import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { CommonHeader, MainLayoutStyle } from "..";
import Layout from "../../components/Layout";
import TLContent from "../../components/TimelinePosts";
import { dateToYMD } from "../../utils/date";
import { getAllTags, getPostsTreeByTime, getSortedTagPosts } from "../../utils/posts";

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
      <TLContent mode='tag' title={tag} posts={posts} />
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

  return {
    props: {
      tag: tag,
      posts: getPostsTreeByTime(posts)
    }
  }
}