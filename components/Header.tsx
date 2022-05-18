import { GetStaticProps } from "next"
import Link from "next/link"
import React, { useContext, useEffect, useState } from "react"
import styled, { ThemeContext } from "styled-components"
import { throttle } from "../utils/throttle"
import Sidebar from "./Sidebar"

export default function Header() {
  const theme = useContext(ThemeContext)
  const [isHidden, setisHidden] = useState(false)
  const [isSidebar, setIsSidebar] = useState(false)

  useEffect(() => { // This will be rendered twice?
    let previousTop = globalThis.scrollY
    const onScroll: EventListener = () => { // <-- DOM-EventListener
      if (globalThis.scrollY < 63) {
        setisHidden(false)
        previousTop = globalThis.scrollY
        return
      }

      const distance = globalThis.scrollY - previousTop
      if (distance > 50) {
        setisHidden(true)
        previousTop = globalThis.scrollY
      } else if (distance < -10) {
        setisHidden(false)
        previousTop = globalThis.scrollY
      }
    };

    const throttled = throttle(onScroll, 250)
    globalThis.addEventListener("scroll", throttled, true);

    return () => window.removeEventListener("scroll", throttled);
  }, [])

  const toggleSidebar = () => {
    setIsSidebar(!isSidebar)
  }

  return (
    <React.Fragment>
      <Sidebar isShow={isSidebar} toggle={toggleSidebar} />
      <Layout isHidden={isHidden}>
        <Description>
          <div>
            <Link href="/">{"Sansui's blog"}</Link>
          </div>
        </Description>
        <Nav>
          <ol><Link href="/">Posts</Link></ol>
          <ol><Link href="/memos">Memos</Link></ol>
          <ol><Link href="/about">About</Link></ol>
        </Nav>
        <Avatar onClick={toggleSidebar}>
          {/*eslint-disable-next-line @next/next/no-img-element*/}
          <img src={theme.assets.favico} alt="Sansui" />
        </Avatar>
      </Layout>
      <PlaceHolder>
        - 人活着就是为了卡卡西 -
      </PlaceHolder>
    </React.Fragment>
  )
}

const PlaceHolder = styled.div`
    height: 63px;
    width: 100%;
    text-align: center;
    padding-top: 0.625rem;
    font-size: 14px;
    opacity: .6;
`
const Layout = styled.header<{
  isHidden: boolean
}>`
  height: 63px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  background-color: ${(props => props.theme.colors.background)};
  z-index:9;
  transform: ${props => props.isHidden ? "translateY(-100%)" : "translateY(0)"};
  transition: transform .5s ease;
`

const Description = styled.div`
  flex: 1;

  div {
    font-style: italic;
    font-weight: bold;
    margin-left: 1rem;
    padding: 0 .7em 0 0.4em;
    @media screen and (max-width: 580px) {
      font-size: 0.875em;
      width: 9ch;
    }
  }

  a {
    box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.hoverBg};
  }
`
const Nav = styled.nav`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;

  ol {
    padding: 0 1rem;
  }

  a {
    position: relative;
    font-weight: 500;
  }

  a::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0;
    background: ${props => props.theme.colors.hoverBg};
    transition: height .3s ease;
  }
  
  a:hover::before {
    height: 40%;
  }
`
const Avatar = styled.div`
  flex: 1;
  text-align: right;

  img {
    width: 63px;
    height: 63px;
    float: right;
    cursor: pointer;
    @media screen and (max-width: 580px) {
      width: 3rem;
      height: 3rem;
    }
  }
`