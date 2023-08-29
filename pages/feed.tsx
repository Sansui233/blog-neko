import { GetStaticProps } from "next"
import React, { useEffect } from "react"
import { writeRss } from "../lib/rss"

const Atom: React.FC = () => {
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