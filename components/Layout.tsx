import React from "react";
import styled from "styled-components";
import Footer from "./common/Footer";
import Topbar from "./topbar/Topbar";

type Props = React.HTMLProps<HTMLDivElement>

const LayoutContainer: React.FC<Props> = ({ children, ...otherProps }) => {
  return (
    <div {...otherProps}>
      <Topbar />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default LayoutContainer

/**
 * 单栏居中布局
 */
export const OneColLayout = styled.div`
  max-width: 780px;
  margin: 0 auto;
  padding: 0px 48px 48px 48px;

  @media screen and (max-width: 780px) {
    max-width: 580px;
  }

  @media screen and (max-width: 580px) {
    padding: 0 20px 48px 20px;
  }
`

/**
 * 
 * 双栏布局
 * mainChildren number 前n个做为主要展示区的内容
 * siderLocation 选择侧栏放置位置
 */
export const TwoColLayout: React.FC<Props & {
  sep: number,
  siderLocation: "left" | "right",
}> = ({ sep, siderLocation, children, ...otherProps }) => {

  const safeSep = sep > 1 ? sep : 1;

  const list = React.Children.toArray(children)
  let mainCol = list.slice(0, safeSep)
  let sider = list.slice(safeSep)

  return <TwoContainer {...otherProps}>

    {siderLocation === "left"
      ? <Sider>{sider}</Sider>
      : <Main>{mainCol}</Main>}


    {siderLocation === "right"
      ? <Sider>{sider}</Sider>
      : <Main>{mainCol}</Main>}

  </TwoContainer>
}

const TwoContainer = styled.div`
  display: flex;
  justify-content: center;

  @media screen and (max-width: 780px) {
    flex-direction: column;

  }

  @media screen and (max-width: 580px) {
  }

`

const Main = styled.div`
  flex: 3 1 0;
  display: flex;
  flex-direction: column;
  @media screen and (max-width: 780px) {
    flex: 1 1 0;
  }

`

const Sider = styled.div`
  flex: 1 1 0;
  display: flex;
  flex-direction: column;

  position: sticky;
  top: 0px;
  max-height: 100vh;
`
