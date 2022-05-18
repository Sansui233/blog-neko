import Link from "next/link"
import styled, { ThemeContext } from "styled-components"
import { useContext } from "react"
import { getAppTheme, setAppTheme, ThemeMsg } from "../utils/app-states"
import { textStroke } from "../styles/styles"

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

  return (
    <Container className={isShow ? '' : 'hidden'}>
      <Content style={{ paddingTop: '8rem' }}>
        <h1>
          <span>
            {"Sansui's blog"}
          </span>
        </h1>
        <div onClick={handleThemeChange}>
          <OptionText style={{ fontSize: '1.625rem' }}>
            {themeContext.mode.toUpperCase()} THEME
          </OptionText>
        </div>
        <div><OptionText><Link href="/categories">{"TAGS"}</Link></OptionText></div>
        <div><OptionText><Link href="/atom.xml">RSS</Link></OptionText></div>
        <p style={{ paddingTop: '2em' }}>持续完善中</p>
        <p>Sansui 2022 All rights reserved</p>
      </Content>
    </Container>)
}

const Container = styled.div`
  background: ${p => p.theme.colors.bg};
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 10;
  transform: translateY(0);
  transition: transform 1s cubic-bezier(0.35, 0, 0.15, 1);

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
      background: ${p => p.theme.colors.gold};
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
  position: relative;
  transition: box-shadow .3s ease;
  cursor: pointer;

  :hover {
    box-shadow: inset 0 -0.5em 0 #ffffff55;
    transform: scale(1.2);
  }
`
