import React from 'react'
import styled from 'styled-components'

type Props = {}

const Footer = (props: Props) => {
  return (
    <Container>
      <a href="https://github.com/sansui233"><i className='icon-github-rounded'></i></a>
      <a href="mailto:sansuilnm@gmail.com"><i className='icon-email-rounded'></i></a>
      <a href="/atom.xml"><i className='icon-rss-rounded'></i></a>
      <div>{"Code & Design by Sansui 2022"} <br /> {"All rights reserved"}</div>
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
    color: ${p => p.theme.colors.textGray};
  }

  i {
    font-size: 1.5rem;
    margin: 0 0.5rem;
  }
`

export default Footer