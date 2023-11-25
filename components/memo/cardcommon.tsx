import { LucideIcon } from "lucide-react"
import React from "react"
import styled from "styled-components"


type Props = React.HTMLProps<HTMLDivElement> & {
  title: string,
  Icon?: LucideIcon
}

export default function CardCommon({ title, Icon, children, ...otherprops }: Props) {
  return <CardContainer {...otherprops}>
    <CardTitle>
      {Icon && <Icon size={"1.1em"} style={{ marginRight: "0.5em" }} />}
      {title}
    </CardTitle>
    <div style={{ paddingTop: "0.5rem" }}>
      {children}
    </div>
  </CardContainer>
}

const CardContainer = styled.section`
  margin-top: 1rem;
  padding: 1rem 1rem;
  position: relative;
  color:${p => p.theme.colors.textPrimary};
`

const CardTitle = styled.div`
  font-size: 0.9rem;
  font-weight: bold;
  color: ${p => p.theme.colors.textGray2};
`