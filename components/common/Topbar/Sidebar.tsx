import { Github, Mail, Rss } from "lucide-react"
import Link from "next/link"
import { useContext, useMemo } from "react"
import styled, { ThemeContext } from "styled-components"
import { ThemeMsg, getAppTheme, setAppTheme } from "../../../lib/app-states"
import { siteInfo } from "../../../site.config"
import { linkHoverBS, textStroke } from "../../../styles/styles"
import MenuIcon from "./menuicon"

type Props = {
  isShow: boolean,
  toggle: () => void
}

export default function Sidebar({ isShow, toggle }: Props) {
  const themeContext = useContext(ThemeContext)

  function handleThemeChange() {
    const t = getAppTheme()
    const targetTheme = (t === 'system' ?
      'dark' : t === 'dark' ?
        'light' : 'system') as ThemeMsg;

    setAppTheme(targetTheme)
  }

  const themeText = useMemo(() => {
    const t = themeContext!.mode
    return t === 'system' ? '系统外观' :
      t === 'dark' ? '夜间模式'
        : '日间模式'
  }, [themeContext])

  return (
    <Container className={isShow ? '' : 'hidden'}>
      <Content style={{ paddingTop: '8rem' }}>
        <h1>
          <span>
            {"SANSUI'S BLOG"}
          </span>
        </h1>
        <div onClick={handleThemeChange}>
          <OptionText>
            {themeText}
          </OptionText>
        </div>
        <div><OptionText><Link href="/categories">分类</Link></OptionText></div>
        <div><OptionText><Link href="/atom.xml">RSS</Link></OptionText></div>
        <LastSection>
          <Icons>
            <a href={siteInfo.social.github}><Github /></a>
            <a href={`mailto:${siteInfo.social.email}`}><Mail /></a>
            <a href="/rss"><Rss /></a>
          </Icons>
          <div style={{ margin: "1rem auto" }}>Sansui 2022 All rights reserved</div>
        </LastSection>
      </Content>
      <PositionedClose>
        <MenuIcon isClose={true} isCloseToggler={toggle} />
      </PositionedClose>
    </Container>)
}

const PositionedClose = styled.div`
  width: 24px;
  height: 20px;
  position: fixed;
  top: 22px;
  right: 20px;
`

const LastSection = styled.div`
  font-weight: 400;
  padding-top: 3rem;
  font-size: 0.625rem;
`

const Icons = styled.div`
  margin: 1rem 0;
  a{
    transition: color .5s;
  }

  a:hover {
    color: ${p => p.theme.colors.accent};
  }

  svg {
    font-size: 1.5rem;
    margin: 0 0.25rem;
  }
`

const Container = styled.div`
  background: ${p => p.theme.colors.bg};
  overflow: auto;
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 10;
  transform: translateY(0);
  transition: transform 1s cubic-bezier(0.46, 0, 0.08, 1.11);

  &.hidden {
    transform: translateY(-100%);
  }

  h1 {
    ${() => textStroke}
    span{
      position: relative;
    }
    span::after {
      content:'';
      position: absolute;
      left:0;
      bottom: -1rem;
      width: 100%;
      height: 1px;
      background: ${p => p.theme.colors.accent};
    }
  }
`

const Content = styled.div`
  margin: 0 auto;
  padding: 92px 0px;
  text-align: center;
  font-weight: bold;
`

const OptionText = styled.span`

  font-size: 1.625rem;
  line-height: 2.75rem;
  position: relative;
  transition: box-shadow .3s ease;
  cursor: pointer;

  &:hover {
    ${linkHoverBS}
    transform: scale(1.2);
  }
`
