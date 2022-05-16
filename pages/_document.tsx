import Document, { DocumentContext, DocumentInitialProps } from 'next/document'
import React from 'react'
import { ServerStyleSheet } from 'styled-components'

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet()
    const originalRenderpage = ctx.renderPage

    try {
      ctx.renderPage = () => originalRenderpage({
        // ?这个 enhancer 函数哪里用啊……是渲染时传给server？没懂这个 API 设计
        enhanceApp: (App) => (props) =>
          sheet.collectStyles(<App {...props} />)
      })

      const initialProps = await Document.getInitialProps(ctx)

      return {
        ...initialProps,
        styles: ([
          <>
            {initialProps.styles}{sheet.getStyleElement()}
          </>
        ]),
      }

    } finally {
      sheet.seal()
    }
  }
}