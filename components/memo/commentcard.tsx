import { WalineComment } from '@waline/client'
import { useContext, useEffect, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { siteInfo } from '../../site.config'
import { HoverWithBoxShadow } from '../../styles/components/link-with-line'
import Model from '../common/model'
import Waline from '../common/waline'
import CardCommon from './cardcommon'

// api doc: https://waline.js.org/reference/server/api.html
// xxx.com/comment?path=%2Fmemos&pageSize=10&page=1&lang=en-US&sortBy=insertedAt_desc

export default function CommentCard() {
  const theme = useContext(ThemeContext)
  const [comments, setComments] = useState<Array<WalineComment>>([])
  const [isModel, setIsModel] = useState(false)

  useEffect(() => {
    const path = encodeURIComponent(globalThis.location.pathname)
    fetch(siteInfo.walineApi + "/comment?path=" + path + "&pageSize=10&page=1&lang=en-US&sortBy=insertedAt_desc")
      .then(res => res.json())
      .then(data => {
        setComments(data.data)
      })
  }, [])

  return (
    <>
      {isModel && <Model isModel={isModel} setModel={setIsModel} style={{ background: theme?.colors.bgMask }}>
        <ModelContainer>
          <Waline />
        </ModelContainer>
      </Model>}

      <CardCommon title='COMMENTS'>
        <Container>
          {comments.map(item => <li key={item.objectId}>{item.comment.replace(/<[^>]*>/g, '')}</li>)}
        </Container>
        <ModelButton>
          <HoverWithBoxShadow onClick={() => setIsModel(true)}>给我留言</HoverWithBoxShadow>
        </ModelButton>
      </CardCommon>
    </>
  )
}

const Container = styled.div`
  font-size: 0.9rem;
  
  li {
    list-style: none;
    margin: 0.5rem 0;
    padding-left: 0.25rem;
    height: 1.5em;
    overflow: hidden;
  }
`
const ModelButton = styled.span`
  display: inline-block;
  margin-top: 2rem;
  padding-right: 0.5rem;
  font-weight: bold;
  color:${p => p.theme.colors.textGray2};
  transition: color 0.5s ease;

  &:hover {
    color:${p => p.theme.colors.textPrimary};
  }
`

const ModelContainer = styled.div`
  height:100%;
  width:100%;
  padding-top:64px;
  overflow-y: auto;

  &>div{
    max-width: min(90%, 640px);
  }
`
