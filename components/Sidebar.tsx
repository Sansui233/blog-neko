import Link from "next/link"
import styled, { ThemeContext } from "styled-components"
import { fadeIn, TextFocusIn } from "../styles/animations"
import { useContext, useState } from "react"
import { getAppTheme, setAppTheme, ThemeMsg } from "../utils/app-states"

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

  return (isShow ? (
    <Container>
      <Close onClick={toggle}>X</Close>
      <Content>
        <div onClick={handleThemeChange}>
          <OptionText style={{ fontSize: '1.625rem' }}>
            {themeContext.mode.toUpperCase()} THEME
          </OptionText>
        </div>
        <div><OptionText><Link href="/atom.xml">RSS</Link></OptionText></div>
        <p style={{ paddingTop: '2em' }}>仍在开发中</p>
        <p>Sansui 2022 All rights reserved</p>
      </Content>
    </Container>) : null)
}

const Container = styled.div`
  background: #000000e3;
  backdrop-filter: blur(6px);
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 2;
  color: white;
  animation: ${fadeIn} .7s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
`

const Close = styled.div`
  position: fixed;
  top: 16px;
  right: 32px;
  cursor: pointer;
  font-size: 3rem;


  :hover {
    transform: scale(1.2);
  }

`

const Content = styled.div`
  margin: 0 auto;
  padding: 92px 0px;
  text-align: center;
  font-size: 4rem;
  font-weight: bold;
`

const OptionText = styled.span`
  position: relative;
  box-shadow: inset 0 0 0 #ffffff55;
  transition: box-shadow .5s ease;
  animation: ${TextFocusIn} .7s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
  cursor: pointer;

  :hover {
    box-shadow: inset 0 -0.5em 0 #ffffff55;
  }
`
