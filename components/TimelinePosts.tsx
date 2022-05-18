import Link from "next/link"
import styled from "styled-components";
import { MainLayoutStyle } from "../pages";

/**
 * 生成具体的标签页和分类页内容，以时间线排序
 */

type Props = {
  mode: 'tag' | 'category', // 分类模式
  title: string,
  posts: {
    [year: string]: {
      id: string;
      title: string;
      date: string;
    }[];
  }
}

export default function TLContent({ mode, title, posts }: Props) {
  return (
    <CategoryLayoutStyle>
      <CategoryTitle>
        {/*  mode 的 index page 链接。逻辑上 tag 和 category 应该分开，但在自己的场景下是写一起的，共用一个 index page*/}
        <Link href="/categories">{mode.toUpperCase()}</Link>
        <h1>{title}</h1>
      </CategoryTitle>
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
    </CategoryLayoutStyle>
  )
}

export const CategoryLayoutStyle = styled(MainLayoutStyle)`
  @media screen and (max-width: 580px) {
    padding: 0 48px 48px 48px;
  }
`

export const CategoryTitle = styled.div`
  margin: 0 auto;
  text-align: center;
  padding: 3rem 0 1rem 0;

  a,span {
    opacity: .5;
    transition: opacity .3s;
  }
  a:hover {
    opacity: 1;
  }
`

const TLSectionStyle = styled.section`
  display: flex;
  margin: 2rem 0;

  @media screen and (max-width: 780px){
    flex-direction: column;
  }
`

const TLYearStyle = styled.div`
  font-size: 2rem;
  font-weight: bold;
  flex: 1 1 0;

  @media screen and (max-width: 780px){
    font-size: 1.5rem;
  }
`

const TLDateStyle = styled.span`
  padding: 0 .5rem;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textGray};
  font-family: Dosis;
`

const TLPostsContainer = styled.ul`
  margin: .125rem 0;
  padding-left: 1.5rem;
  flex: 2.5 1 0;
  @media screen and (max-width: 780px){
    margin: 1rem 0;
  }

  a {
    box-shadow: inset 0 0 0 ${props => props.theme.colors.hoverBg};
    transition: box-shadow .3s;
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