import NextDocument, { DocumentContext, DocumentInitialProps, DocumentProps } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

import { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'
import jsdelivrFallback from '../lib/script/jsdelivr'

function Document<P = {}>(props: DocumentProps & P) {
  return (
    <Html>
      <Head>
        <Script id='jsdelivr' strategy='beforeInteractive'>{jsdelivrFallback}</Script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

Document.getInitialProps = async (ctx: DocumentContext): Promise<DocumentInitialProps> => {
  // styled componenets server side rendering
  const sheet = new ServerStyleSheet()
  const originalRenderpage = ctx.renderPage
  try {
    ctx.renderPage = () => originalRenderpage({
      enhanceApp: (App) => (props) =>
        sheet.collectStyles(<App {...props} />)
    })

    const initialProps = await NextDocument.getInitialProps(ctx)

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

export default Document