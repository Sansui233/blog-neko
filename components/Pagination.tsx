import Link from 'next/link'
import React from 'react'
import styled from 'styled-components'

type Props = {
  nextPage?: {
    title: string,
    link: string,
  }
  prevPage?: {
    title: string,
    link: string,
  },
  currTitle?: string
}

const Pagination: React.FC<Props> = (props) => {
  return (
    <Layout>
      {props.prevPage &&
        <div style={{ flex: "1 1 auto" }}>
          <Link href={props.prevPage.link} passHref={true}>
            <PageBtn style={{ justifyContent: "flex-start" }}><span><i className="icon-arrow-left2" />&nbsp;{props.prevPage.title}</span></PageBtn>
          </Link>
        </div>
      }
      <span>{props.currTitle ? props.currTitle : ''}</span>
      {props.nextPage &&
        <div style={{ flex: "1 1 auto" }}>
          <Link href={props.nextPage.link} passHref={true}>
            <PageBtn style={{ justifyContent: "flex-end" }}><span>{props.nextPage.title}&nbsp;<i className="icon-arrow-right2" /></span></PageBtn>
          </Link>
        </div>
      }
    </Layout>
  )
}

const Layout = styled.div`
  margin: 64px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;

  & > span {
    color: ${p => p.theme.colors.textGray};
    font-size: 0.875rem;
  }
`

const PageBtn = styled.a`
  padding: .2em 0;
  display: flex;
  align-items: center;
  position: relative;
  i {
    transform: translateY(-0.1em);
  }

  span {
    position: relative;
  }

  span::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 0;
    height: 2px;
    background: ${props => props.theme.colors.gold};
    transition: width 1s cubic-bezier(0.34, 0.04, 0.03, 1.4), background .3s;
  }
    
  span:hover::before {
    width: 100%;
  }
`


export default Pagination