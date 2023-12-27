import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import LayoutContainer, { OneColLayout } from '../components/layout'
import NavDropper from '../components/post/nav-dropper'
import { POST_DIR, buildIndex, posts_db } from '../lib/data/server'
import { siteInfo } from '../site.config'
import { hoverBoxShadow } from '../styles/styles'

type PostType = {
  id: string,
  date: string,
  title?: string,
  categories?: string,
  description?: string,
  tags?: string | string[],
}

type Props = {
  posts: PostType[],
  categories: [string, number][]
}


export const CommonHead = () => (
  <React.Fragment>
    <meta name="description" content="A personal blog about work and life" />
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
    <link rel="icon" href="/favicon.ico" />
  </React.Fragment>
)

const Home: NextPage<Props> = ({ posts, categories }: Props) => {
  const [currCategory, setCurrCategory] = useState(0)

  const filteredPosts = useMemo<PostType[]>(() => {
    if (currCategory === 0) {
      return posts
    } else {
      return posts.filter(p => {
        return p.categories === categories[currCategory][0]
      })
    }
  }, [currCategory, posts, categories])

  return (
    <div>
      <Head>
        <title>{`${siteInfo.author} - Blog`}</title>
        <CommonHead />
      </Head>
      <LayoutContainer>
        <OneColLayout>
          <NavDropper items={categories} current={currCategory} setCurrent={setCurrCategory} />
          <PostGrids>
            {filteredPosts.map((post, i) => {
              return (<ArticleItem key={post.id} p={post} i={i} />)
            })}
            {/* {transition((style, p, _, i) => {
              return <ArticleItem p={p} springStyle={style} key={p.id} index={i}/>
            })} */}
          </PostGrids>
        </OneColLayout>
      </LayoutContainer>
    </div>
  )
}

function ArticleItem({ p, i }: {
  p: PostType,
  i: number
}) {
  return (
    <Card href={'/posts/' + p.id} passHref={true}>
      <div className='card-content'>
        <div className='meta'>
          <span className='date'>{p.date.slice(0, 11)}</span>
          <span className="category">
            {p.categories}
          </span>
        </div>
        <span className='title'>{p.title}</span>
        <div className="meta description">
          {p.description}
        </div>
      </div>
    </Card>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  buildIndex(POST_DIR, require("path").join(process.cwd(), 'public', 'data', 'posts'))
  return {
    props: {
      posts: posts_db.metas,
      categories: Array.from(posts_db.categories())
    }
  }
}

export default Home

const PostGrids = styled.section`
  display: grid;
  justify-content: center;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 2.5rem;

  @media screen and (max-width: 780px) {
    grid-template-columns: repeat(1, 100%);
  }
`

const Card = styled(Link)`
  display: block;
  min-height: 6rem;
  cursor: pointer;
  animation-fill-mode: forwards;
  position: relative;
  /*border-bottom: dotted 2px ${p => p.theme.colors.uiLineGray};*/

  .title {
    font-size: 1.125rem;
    font-weight: bold;
    transition: box-shadow .5s;

  }

  @media (any-hover: hover) {
    &:hover{
      .title{
        ${hoverBoxShadow}
      }
    }
  }

  @media (any-hover: none) {
    &:active{
      .title{
        ${hoverBoxShadow}
      }
    }
  }

  @media screen and (max-width: 780px){
    min-height: 5.25rem;
  }

  .card-content {
    padding: 1rem 0 2.5rem 0;
}

  .meta {
    margin: 0.25rem 0;
    font-size: 0.9rem;
    color: ${p => p.theme.colors.textGray2};
  }

  .date {
    font-weight: bold;
    color: ${p => p.theme.colors.textGray2};
  }

  .category {
    font-weight: bold;
    display: inline-block;
    margin-left: 0.25em;
  }
`
