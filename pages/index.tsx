import { Folder } from 'lucide-react'
import type { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import LayoutContainer, { OneColLayout } from '../components/layout'
import NavDropper from '../components/post/nav-dropper'
import { POST_DIR, buildIndex, posts_db } from '../lib/data/server'
import { siteInfo } from '../site.config'
import { bottomFadeIn } from '../styles/animations'
import { floatBoxShadow } from '../styles/styles'

type PostType = {
  id: string,
  date: string,
  title?: string,
  categories?: string,
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
        <Title>{p.title}</Title>
        <div className='meta'>
          <span className='date'>{p.date}</span>
          <span>{` | `}</span>
          <Folder size={"1.1em"} style={{ margin: "0 0.2rem", paddingBottom: "0.1em" }} />
          {p.categories}
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
  grid-template-columns: repeat(2, 50%);
  grid-row-gap: 1rem;
  grid-column-gap: 1rem;

  @media screen and (max-width: 780px) {
    grid-template-columns: repeat(1, 100%);
  }
`

const Card = styled(Link)`
  display: block;
  min-height: 6rem;
  border-radius: 5px;
  cursor: pointer;
  position: relative;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s;
  opacity: 0;
  animation: ${bottomFadeIn} .5s ease;
  animation-fill-mode: forwards;

  @media (any-hover: hover) {
    &:hover{
      ${() => floatBoxShadow}
    }
  }

  @media (any-hover: none) {
    &:active{
      ${() => floatBoxShadow}
    }
  }

  @media screen and (max-width: 780px){
    min-height: 5.25rem;
  }

  .card-content {
    padding: 1rem;
  }

  .meta {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: ${p => p.theme.colors.textSecondary};
  }

  .date {
    font-size: 0.9rem;
  }
`

const Title = styled.span`
  font-size: 1.125rem;
  font-weight: bold;
`

