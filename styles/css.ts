import { css } from "styled-components";

/***************************************
 * text
 ****************************************/

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

export const hoverRound = css`
content:'';
position: absolute;
left:0;
bottom: 0;
width: 100%;
border-radius: 0.4em;
height: 0.4em;
background: ${p => p.theme.colors.accentHover};
mix-blend-mode: ${p => p.theme.colors.bgFilter};
`

export const hoverBoxShadow = css`box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.accentHover};`


/***************************************
 * card
 ****************************************/
export const dropShadow = css`box-shadow: 0 0 2px 0px ${props => props.theme.colors.shadowBg}, 0 0 8px 0px ${props => props.theme.colors.shadowBg};`
export const dropShadowAccent = css`box-shadow: 0 0 2px 0px ${props => props.theme.colors.accent + "33"}, 0 0 8px 0px ${props => props.theme.colors.accent + "33"};`
export const paperCard = css`background: ${p => p.theme.colors.bg};box-shadow: rgb(0 0 0 / 10%) 0px 2px 4px;`
export const floatMenu = css`
border-radius: 0.75rem;
background: ${p => p.theme.colors.bg};
box-shadow: rgb(0 0 0 / 15%) 0px 0px 7px;
`

/***************************************
 * function
 ****************************************/
export const hideScrollBar = css`&::-webkit-scrollbar{display: none;}`