import Link from "next/link"
import { useRouter } from "next/router"
import React, { useContext, useEffect, useState } from "react"
import styled, { ThemeContext } from "styled-components"
import { throttle } from "../lib/throttle"
import MenuIcon from "./MenuIcon"
import Sidebar from "./Sidebar"

export default function Header() {
  const theme = useContext(ThemeContext)
  const [isHidden, setisHidden] = useState(false)
  const [isSidebar, setIsSidebar] = useState(false)
  const router = useRouter()

  useEffect(() => { // This will be rendered twice?
    let previousTop = globalThis.scrollY
    const onScroll: EventListener = () => { // <-- DOM-EventListener
      if (globalThis.scrollY < 200) {
        setisHidden(false)
        previousTop = globalThis.scrollY
        return
      }

      const distance = globalThis.scrollY - previousTop
      if (distance > 10) {
        setisHidden(true)
        previousTop = globalThis.scrollY
      } else if (distance < -10) {
        setisHidden(false)
        previousTop = globalThis.scrollY
      }
    };

    const throttled = throttle(onScroll, 500)
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
        <More onClick={toggleSidebar}>
          <div>
            <MenuIcon width={"24px"} height={"100%"} isClose={isSidebar} />
          </div>
        </More>
      </Layout>
      <PlaceHolder>
        人活着就是为了卡卡西
      </PlaceHolder>
    </React.Fragment>
  )
}

const PlaceHolder = styled.div`
    height: 63px;
    width: 100%;
    text-align: center;
    padding-top: 0.625rem;
    font-size: 0.625rem;
    font-style: italic;
    color: ${p => p.theme.colors.gold};
    font-family: 'Times New Roman', STSong, '宋体', serif;
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

const More = styled.div`
  flex: 1 1 auto;
  text-align: right;
  font-size: 0.875em;
  cursor: pointer;
  max-width: 63px;
  display: flex;
  
  & > div {
    display: inline-block;
    margin-left: auto;
    margin-right: 20px;
    height: 20px;
    position: relative;
  }

  @media screen and (max-width: 580px) {
    & > div {
      margin-right: 16px;
      padding: 1px 0;
    }
  }
`
const Nav = styled.nav`
  flex: 2 1 auto;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  @media screen and (min-width: 780px) {
    max-width: 50%;
  }
  @media screen and (min-width: 580px) {
    max-width: 390px;
  }
  @media screen and (max-width: 580px) {
    max-width: 290px;
  }
  

  ol {
    padding: 0 .5em;
    padding-top: 2px;
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
  flex: 1 1 auto;
  max-width: 63px;
  display: flex;
  img {
    margin-left: 10px;
    z-index: 11;
    width: 63px;
    height: 63px;
    float: left;
    cursor: pointer;
  }

  @media screen and (max-width: 580px){
    img {
      width: 48px;
      height: 48px;
    }
  }
`