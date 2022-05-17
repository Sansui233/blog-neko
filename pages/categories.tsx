import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import styled from "styled-components";
import { CommonHeader, MainLayoutStyle } from ".";
import Layout from "../components/Layout";
import { getAllCategories } from "../utils/posts";

export default function Categories({ categories }: {
  categories: {
    [k: string]: number;
  }
}) {
  return (
    <>
      <Head>
        <title>{"Sansui's Blog - Categories"}</title>
        <CommonHeader />
      </Head>
      <Layout>
        <MainLayoutStyle>
          <Title>
            <span>CATEGORIES</span>
            <h1>分类</h1>
          </Title>
          <Container>
            {Object.keys(categories).map(k => {
              return (
                <Link href={`/categories/${k}`} passHref={true} key={k}>
                  <LabelStyle>{`${k}(${categories[k]})`}</LabelStyle>
                </Link>
              )
            })}
          </Container>
        </MainLayoutStyle>
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      categories: Object.fromEntries(getAllCategories())
    }
  }
}

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  align-content:flex-start;
`

const LabelStyle = styled.a`
  opacity: .8;
  margin: .3em;
  background-color:${props => props.theme.colors.hoverBg};  
  padding: .3em 1em;
  border-radius: 1em;
  transition: opacity .3s,transform .3s;
  font-size: 0.875rem;
  :hover {
    opacity: 1;
    transform: scale(1.15);
  }
`

export const Title = styled.div`
  margin: 0 auto;
  text-align: center;
  padding: 3rem 0 1rem 0;

  a,span {
    opacity: .5;
    transition: opacity .5s ease;
  }
  a:hover {
    opacity: 1;
  }
`

