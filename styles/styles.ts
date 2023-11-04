import { css } from "styled-components";

export const textStroke = css`
  -webkit-text-stroke: 1px;
  -webkit-text-fill-color: transparent;
`

export const textShadow = {
  s: css`box-shadow: inset 0 -0.3em 0 ${props => props.theme.colors.hoverBg};`,
  m: css`box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.hoverBg};`,
  l: css`box-shadow: inset 0 -0.8em 0 ${props => props.theme.colors.hoverBg};`,
  f: css`box-shadow: inset 0 -1em 0 ${props => props.theme.colors.hoverBg};`
}

export const linkHoverBS = css`box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.goldHover};`

export const floatBoxShadow = css`box-shadow: ${props => props.theme.colors.shadowBg} 0px 0.5rem 2rem;`
export const paperCard = css`background: ${p => p.theme.colors.bg};box-shadow: rgb(0 0 0 / 10%) 0px 2px 4px;`

export const hideScrollBar = css`&::-webkit-scrollbar{display: none;}`