import React from "react"
import styled from "styled-components"


type Props = React.HTMLProps<HTMLDivElement> & {
  title?: string,
}

export default function CardCommon({ title, children, ...otherprops }: Props) {
  return <CardContainer {...otherprops}>
    {title
      ? <CardTitle>{title}</CardTitle>
      : null}
    {children}
  </CardContainer>
}

const CardContainer = styled.section`
  margin-top: 1rem;
  padding: 1rem 1rem;
`

const CardTitle = styled.div`
  font-size: 0.9rem;
  font-weight: bold;
  color: ${p => p.theme.colors.textGray2};
`

export const CardTitleIcon = styled.span`
  display: inline-block;
  text-align: right;
  font-size: 1.125rem;
  color: ${p => p.theme.colors.textGray2};
`