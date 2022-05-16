import { keyframes } from "styled-components";

export const fadeIn = keyframes`
0% {
  opacity: 0;
}
100% {
  opacity: 1;
}`

export const TextFocusIn = keyframes`
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