import { css } from "styled-components";

export const textStroke = css`
  -webkit-text-stroke: 1px;
  -webkit-text-fill-color: transparent;
`

export const textBoxShadow = {
  s: css`box-shadow: inset 0 -0.3em 0 ${props => props.theme.colors.hoverBg};`,
  m: css`box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.hoverBg};`,
  l: css`box-shadow: inset 0 -0.8em 0 ${props => props.theme.colors.hoverBg};`,
  f: css`box-shadow: inset 0 -1em 0 ${props => props.theme.colors.hoverBg};`
}

export const cardBoxShadow = css`box-shadow: ${props => props.theme.colors.shadowBg} 0px 0.5rem 2rem;`