import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { CommonHead } from "..";
import LayoutContainer from "../../components/layout";
import TLContent from "../../components/post/TimelinePosts";
import { groupByYear, posts_db } from "../../lib/data/server";

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
      <title>{`Tag - ${tag}`}</title>
      <CommonHead />
    </Head>
    <LayoutContainer>
      <TLContent mode='tag' title={tag} posts={posts} />
    </LayoutContainer>
  </>)
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Array.from(await posts_db.tags()).map(v => {
    return { params: { id: v[0] } }
  })
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  let tag = params!.id as string
  const p = await posts_db.inTag(tag)

  return {
    props: {
      tag: tag,
      posts: groupByYear(p)
    }
  }
}