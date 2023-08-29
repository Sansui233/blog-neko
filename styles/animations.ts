import { keyframes } from "styled-components";

export const fadeIn = keyframes`
0% {
  opacity: 0;
}
100% {
  opacity: 1;
}`

export const bottomFadeIn = keyframes`
0% {
  opacity: 0;
  transform: translateY(10px);
}
100% {
  opacity: 1;
  transform: translateY(0);
}`

export const fadeInRight = keyframes`
0% {
  -webkit-transform: translateX(50px);
          transform: translateX(50px);
  opacity: 0;
}
100% {
  -webkit-transform: translateX(0);
          transform: translateX(0);
  opacity: 1;
}
`

export const textFocusIn = keyframes`
0% {
  -webkit-filter: blur(12px);
          filter: blur(12px);
  opacity: 0;
}
100% {
  -webkit-filter: blur(0px);
          filter: blur(0px);
  opacity: 1;
}
`

export const slideDown = keyframes`
0% {
  transform: translateY(-100%);
}
100% {
  transform: translateY(0);
}`

export const slideUp = keyframes`
0% {
  transform: translateY(0);
}
100% {
  transform: translateY(-100%);
}`