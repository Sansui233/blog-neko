import Head from "next/head";
import { CommonHeader, MainContent, PageDescription } from ".";
import Header from "../components/Header";
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { MarkdownStyle } from "../styles/markdown";
import remarkGfm from 'remark-gfm'
import styled from "styled-components";
import Layout from "../components/Layout";


const mdText = `

## Hi, I’m Sansui

Github: Sansui233  
E-mail：[sansuilnm@gmail.com](mailto:sansuilnm@gmail.com)

#### Programing

计算机专业。杂食。目前以前端为主，喜欢用~~爱~~懒发电

- 后端：Java, C++, Golang, Python
- 前端：React, Next.js

#### Design&Painting

长期做海报。

业余画二次元插画类。不太会做角色设计。


#### Projects

这个博客算一个。其他大多由于各种原因弃坑。比如

- [FGO素材规划工具](https://github.com/Sansui233/fgomerlin)：是可离线使用的 Web App  
  弃坑原因：不玩了。攒了大半年，抽卡太非，剧情无聊，立绘质量参差不齐
- [FGO-Airtest](https://github.com/Sansui233/fgo-airtest)：ios 可用的游戏自动化刷本工具，俗称外挂，但其实是伪物理外挂，挂机模拟手刷。  
  弃坑原因：不玩了。而且后面安卓和 ios 互通了。
- ~~一个最好不要放这里的项目~~

没弃坑的是在自己在用的小东西

- [Logseq Bonofix Theme](https://github.com/Sansui233/logseq-bonofix-theme): 一个 Logseq 题，保持简洁但感觉更轻松。  
  最开始是因为 Logseq UI 太丑，明明是笔记工具完全没考虑大纲类的排版需要，拿着tailwind 就往上套，配色层级也一言难尽，强迫症无法忍受。  
  现在的话 Logseq 的设计好多了，不过自己还是喜欢己写的主题的轻松感，少有的双色配色，能够轻松聚焦重点，同时又不会花哨。

小工具狂魔，平时写的自用小工具更多一些，基本是个性化的需求。

#### [](#game)Game

- Minecraft
- 塞尔达旷野之息

`

type Props = {
  source: MDXRemoteSerializeResult
}

export default function About({ source }: Props) {
  return (
    <div>
      <Head>
        <title>About Sansui</title>
        <CommonHeader />
      </Head>
      <Layout>
        <MainContent>
          <AboutDescription>| 记录学习和生活思考的博客 |</AboutDescription>
          <MarkdownStyle>
            <MDXRemote {...source} />
          </MarkdownStyle>
        </MainContent>
      </Layout>
    </div>
  )
}


export async function getStaticProps() {
  const source = mdText
  const mdxSource = await serialize(source, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      // TODO not work
    },
  })
  return { props: { source: mdxSource } }
}

const AboutDescription = styled(PageDescription)`
  margin-bottom: -2rem;
`