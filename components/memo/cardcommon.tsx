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
      {Icon && <Icon size={"1em"} style={{ marginRight: "0.5em" }} />}
      {title}
    </CardTitle>
    <div style={{ paddingTop: "0.5rem" }}>
      {children}
    </div>
  </CardContainer>
}

const CardContainer = styled.section`
  margin-top: 1.5rem;
  padding: 0.5rem 1rem;
  line-height: 1.625rem;
  color:${p => p.theme.colors.textSecondary};
`

const CardTitle = styled.div`
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  color: ${p => p.theme.colors.textGray2};
`