import Link from "next/link"
import { useRouter } from "next/router"
import React, { useContext, useEffect, useRef, useState } from "react"
import styled, { ThemeContext } from "styled-components"
import { throttle } from "../lib/throttle"
import { siteInfo } from "../site.config"
import MenuIcon from "./MenuIcon"
import SearchBox from "./SearchBox"
import Sidebar from "./Sidebar"

export default function Header() {
  const theme = useContext(ThemeContext)
  const [isHidden, setisHidden] = useState(false)
  const [isSidebar, setIsSidebar] = useState(false)
  const [isSearch, setisSearch] = useState(false)
  const router = useRouter()
  const searchIcon = useRef<HTMLDivElement>(null)

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

    const throttled = throttle(onScroll, 80)
    globalThis.addEventListener("scroll", throttled, true);

    return () => window.removeEventListener("scroll", throttled);
  }, [])

  const toggleSidebar = () => {
    setIsSidebar(!isSidebar)
  }

  const clickSearch = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setisSearch(!isSearch)
  }

  const updateSearch = (innerState: boolean) => {
    setisSearch(innerState)
  }

  return (
    <React.Fragment>
      <SearchBox outSetSearch={updateSearch} stateToInner={isSearch} iconEle={searchIcon} />
      <Sidebar isShow={isSidebar} toggle={toggleSidebar} />
      <Layout $isHidden={isHidden}>
        <Avatar >
          <Link href="/" passHref={true}>
            {/*eslint-disable-next-line @next/next/no-img-element*/}
            <img src={theme!.assets.favico} alt={siteInfo.author} />
          </Link>
        </Avatar>
        <Nav>
          <ol className={router.pathname === "/" ? 'current' : ''}><Link href="/">Posts</Link></ol>
          <ol className={router.pathname === "/memos" ? 'current' : ''}><Link href="/memos">Memos</Link></ol>
          <ol className={router.pathname === "/about" ? 'current' : ''}><Link href="/about">About</Link></ol>
        </Nav>
        <More >
          <SearchIcon ref={searchIcon} onClick={(e) => { clickSearch(e) }} $isSearch={isSearch}>
            <i className='icon-search' style={{ fontSize: "1.725rem" }} />
          </SearchIcon>
          <div onClick={toggleSidebar} style={{ marginRight: "20px", width: "22px" }}>
            <MenuIcon width={"100%"} height={"21px"} isClose={isSidebar} />
          </div>
        </More>
      </Layout>
      <PlaceHolder>
        人活着就是为了卡卡西
      </PlaceHolder>
    </React.Fragment>
  );
}

const SearchIcon = styled.div<{ $isSearch: boolean }>`
  ${p => p.$isSearch ? "color:" + p.theme.colors.gold + ";" : ""}
  transform: translateY(0.145rem);
  transition: color 0.3s ease;

  &:hover {
    color: ${p => p.theme.colors.goldHover};
  }
`
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
  $isHidden: boolean
}>`
  height: 63px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  background-color: ${(props => props.theme.colors.bg)};
  z-index:10;
  transform: ${props => props.$isHidden ? "translateY(-100%)" : "translateY(0)"};
  transition: transform .5s ease;
`

// Common Property to make nav middle aligned
const LeftRight = styled.div`
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: flex-end;

`
const Avatar = styled(LeftRight)`
  flex: 1 1 auto;
  display: flex;
  img {
    margin-left: 10px;
    z-index: 11;
    width: 63px;
    height: 63px;
    float: left;
    cursor: pointer;
  }
  justify-content: flex-start;

  @media screen and (max-width: 580px){
    img {
      width: 48px;
      height: 48px;
    }
  }
  @media screen and (max-width: 350px){
    display: none
  }
`

const More = styled(LeftRight)`
  text-align: right;
  font-size: 0.875em;
  cursor: pointer;
  
  & > div {
    display: inline-block;
    margin-right: 15px;
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