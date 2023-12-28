import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { THEME_CHANGED_EVT, ThemeCallBack, ThemeMsg, emitter, getAppTheme } from '../lib/app-states'
import * as gtag from '../lib/gtag'
import { siteInfo } from '../site.config'
import { darkTheme, genSystemTheme, lightTheme } from '../styles/colors'
import { GlobalStyle } from '../styles/global'
import '../styles/global.css'

function MyApp({ Component, pageProps }: AppProps) {

  const [theme, setTheme] = useState(lightTheme);
  const themeRef = useRef(theme) // 防止 theme 更新而反复 addListener
  const router = useRouter()

  // Google Analystics
  useEffect(() => {
    if ((!("GAId" in siteInfo)) || siteInfo.GAId === "") {
      return
    }
    const handleRouteChange = (url: string) => {
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('hashChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('hashChangeComplete', handleRouteChange)
    }
  }, [router.events])

  useEffect(() => { themeRef.current = theme }, [theme])

  // Set Global Theme Context
  useEffect(() => {
    setTheme(getAppTheme() === 'dark' ?
      darkTheme : getAppTheme() === 'light' ?
        lightTheme : genSystemTheme())
    // subscribe changes
    const themeCallback: ThemeCallBack = (themeText: ThemeMsg) => {
      setTheme(themeText === 'dark' ?
        darkTheme : themeText === 'light' ?
          lightTheme : genSystemTheme())
    }
    emitter.on(THEME_CHANGED_EVT, themeCallback);

    const systemThemeCallBack = () => {
      if (themeRef.current.mode === 'system') {
        setTheme(genSystemTheme())
      }
    }
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', systemThemeCallBack)

    return () => {
      emitter.removeListener(THEME_CHANGED_EVT, themeCallback)
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener('change', systemThemeCallBack)
    }
  }, [themeRef])

  return <>
    {/* Global Site Tag (gtag.js) - Google Analytics */}
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Component {...pageProps} />
    </ThemeProvider>
    <Script
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
    />
    <Script
      id="gtag-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${gtag.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
      }}
    />
  </>
}

export default MyApp
