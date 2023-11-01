import { MDXProvider } from '@mdx-js/react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import ImgModel from '../../components/ImgModel'


export function postRsc(compiledSource: MDXRemoteSerializeResult) {
  return (
    <MDXProvider components={{ ImgModel }}>
      <MDXRemote {...compiledSource} />
    </MDXProvider>
  )
}

export function memoRsc(compiledSource: MDXRemoteSerializeResult) {
  return (
    <MDXRemote {...compiledSource} />
  )
}