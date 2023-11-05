import styled from 'styled-components'
import { siteInfo } from '../../site.config'

const Footer = () => {
  return (
    <Container>
      <a href={siteInfo.social.github}><i className='icon-github-rounded'></i></a>
      <a href={`mailto:${siteInfo.social.email}`}><i className='icon-email-rounded'></i></a>
      <a href="/rss"><i className='icon-rss-rounded'></i></a>
      <div>{"Code & Design by Sansui 2023"} <br /> {"All rights reserved"}</div>
    </Container>
  )
}

const Container = styled.div`
  padding: 24px 0 10px 0;
  text-align: center;
  font-size: 0.625rem;

  div {
    margin: 1rem auto;
  }

  a{
    transition: color .5s;
  }

  a:hover {
    color: ${p => p.theme.colors.goldHover};
  }

  i {
    font-size: 1.5rem;
    margin: 0 0.5rem;
  }
`

export default Footer