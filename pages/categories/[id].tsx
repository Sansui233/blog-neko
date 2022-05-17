import { getAllCategories, getSortedCategoryPosts } from "../../utils/posts";
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from "next/head";
import { CommonHeader, MainLayoutStyle } from "..";
import Layout from "../../components/Layout";
import styled from "styled-components";
import { dateToYMD } from "../../utils/date";
import Link from "next/link";
import { Title } from ".";

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
        <title>Category - {category}</title>
        <CommonHeader />
      </Head>
      <Layout>
        <MainLayoutStyle>
          <Title>
            <Link href="/categories">CATEGORY</Link>
            <h1>{category}</h1>
          </Title>
          {Object.keys(posts).sort((a, b) => a < b ? 1 : -1).map(year => {
            return (
              <Section key={year}>
                <Year>{year}</Year>
                <PostsContainer>
                  {posts[year].map(p => {
                    return (<li key={p.id}>
                      <Link href={`/posts/${p.id}`}>{p.title}</Link>
                      <Date>{p.date.slice(5)}</Date>
                    </li>)
                  })}
                </PostsContainer>
              </Section>
            )
          })}
        </MainLayoutStyle>

      </Layout>
    </>
  )
}



const Section = styled.section`
  display: flex;
  margin: 2rem 0;

  @media screen and (max-width: 780px){
    flex-direction: column;
  }
`

const Year = styled.div`
  font-size: 2rem;
  font-weight: bold;
  flex: 1 1 0;

  @media screen and (max-width: 780px){
    font-size: 1.5rem;
  }
`

const Date = styled.span`
  padding: 0 .5rem;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textGray};
  font-family: Dosis;
`

const PostsContainer = styled.ul`
  margin: .125rem 0;
  padding-left: 1.5rem;
  flex: 2.5 1 0;
  @media screen and (max-width: 780px){
    margin: 1rem 0;
  }

  a {
    box-shadow: inset 0 0 0 ${props => props.theme.colors.hoverBg};
    transition: box-shadow .5s ease;
  }

  a:hover {
    box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.hoverBg};
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
  const paths = Array.from(getAllCategories()).map(v => {
    return { params: { id: v[0] } }
  })
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  let category = params!.id as string
  const posts = getSortedCategoryPosts(category)

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
      category: category,
      posts: Object.fromEntries(postsTree)
    }
  }
}