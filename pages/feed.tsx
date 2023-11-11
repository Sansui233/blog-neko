import { GetStaticProps } from "next"
import { useEffect } from "react"
import { writeRss } from "../lib/data/server"

const Atom = () => {
  useEffect(() => {
    window.location.href = "/feed.json"
  }, [])

  return null
}

// update static rss files
export const getStaticProps: GetStaticProps = async () => {
  writeRss()
  return {
    props: {}
  }
}
export default Atom