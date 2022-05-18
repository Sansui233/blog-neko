import { GetStaticProps } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useContext, useEffect, useState } from "react"
import styled, { ThemeContext } from "styled-components"
import { throttle } from "../utils/throttle"
import Sidebar from "./Sidebar"

export default function Header() {
  const theme = useContext(ThemeContext)
  const [isHidden, setisHidden] = useState(false)
  const [isSidebar, setIsSidebar] = useState(false)
  const router = useRouter()

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
        <Avatar >
          <Link href="/" passHref={true}>
            {/*eslint-disable-next-line @next/next/no-img-element*/}
            <a><img src={theme.assets.favico} alt="Sansui" /></a>
          </Link>
        </Avatar>
        <Nav>
          <ol className={router.pathname === "/" ? 'current' : ''}><Link href="/">Posts</Link></ol>
          <ol className={router.pathname === "/memos" ? 'current' : ''}><Link href="/memos">Memos</Link></ol>
          <ol className={router.pathname === "/about" ? 'current' : ''}><Link href="/about">About</Link></ol>
        </Nav>
        <Description onClick={toggleSidebar}>
          <span>{"MORE"}</span>
        </Description>
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
  background-color: ${(props => props.theme.colors.bg)};
  z-index:10;
  transform: ${props => props.isHidden ? "translateY(-100%)" : "translateY(0)"};
  transition: transform .5s ease;
`

const Description = styled.div`
  flex: 1;
  text-align: right;
  font-size: 0.875em;
  padding: 0 .7em 0 0.4em;
  cursor: pointer;

  margin-left: 1rem;
  @media screen and (max-width: 580px) {
    font-size: 0.875em;
    width: 9ch;
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
    bottom: -3px;
    width: 0;
    height: 2px;
    background: ${props => props.theme.colors.gold};
    transition: width 1s cubic-bezier(0.34, 0.04, 0.03, 1.4), background .3s;
  }
    
  a:hover::before {
    width: 100%;
  }

  ol.current a{
    color: ${props => props.theme.colors.gold};
  }

`
const Avatar = styled.div`
  flex: 1;
  text-align: right;

  img {
    width: 63px;
    height: 63px;
    float: left;
    cursor: pointer;
    @media screen and (max-width: 580px) {
      width: 3rem;
      height: 3rem;
    }
  }
`