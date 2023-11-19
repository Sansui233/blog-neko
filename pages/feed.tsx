import { GetStaticProps } from "next"
import { useEffect } from "react"
import { writeRss, writeSiteMap } from "../lib/data/server"

const Atom = () => {
  useEffect(() => {
    window.location.href = "/feed.json"
  }, [])

  return null
}

// update static rss files
// sitemap
export const getStaticProps: GetStaticProps = async () => {
  writeRss()
  writeSiteMap()
  return {
    props: {}
  }

}
export default Atom