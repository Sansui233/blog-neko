import { GetStaticPaths, GetStaticProps } from 'next';
import Head from "next/head";
import styled from "styled-components";
import { CommonHead } from "..";
import LayoutContainer from "../../components/Layout";
import TLContent from "../../components/TimelinePosts";
import { groupByYear, posts_db } from "../../lib/data/posts";
import { textShadow } from "../../styles/styles";

type Props = {
  category: string,
  posts: {
    [year: string]: {
      id: string;
      title: string;
      date: string;
    }[];
  }
}

export default function CategoryPage({ category, posts }: Props) {

  return (
    <>
      <Head>
        <title>${`Category - ${category}`}</title>
        <CommonHead />
      </Head>
      <LayoutContainer>
        <TLContent mode='category' title={category} posts={posts} />
      </LayoutContainer>
    </>
  )
}



export const TLSectionStyle = styled.section`
  display: flex;
  margin: 2rem 0;

  @media screen and (max-width: 780px){
    flex-direction: column;
  }
`

export const TLYearStyle = styled.div`
  font-size: 2rem;
  font-weight: bold;
  flex: 1 1 0;

  @media screen and (max-width: 780px){
    font-size: 1.5rem;
  }
`

export const TLDateStyle = styled.span`
  padding: 0 .5rem;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textGray};
  font-family: Dosis;
`

export const TLPostsContainer = styled.ul`
  margin: .125rem 0;
  padding-left: 1.5rem;
  flex: 2.5 1 0;
  @media screen and (max-width: 780px){
    margin: 1rem 0;
  }

  a {
    transition: box-shadow .3s;
  }

  a:hover {
    ${() => textShadow.m}
  }

  li {
    display: block;
    position: relative;
  }
  li::before {
    content:'•';
    position: absolute;
    left: -1.5rem;
    padding-right: 1rem;
  }
`

export const getStaticPaths: GetStaticPaths = async () => {

  const paths = Array.from(await posts_db.categories()).map(v => {
    return { params: { id: v[0] } }
  })
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  let category = params!.id as string
  const p = await posts_db.inCategory(category)

  return {
    props: {
      category: category,
      posts: groupByYear(p)
    }
  }
}