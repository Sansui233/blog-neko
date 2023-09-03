import { styled } from "styled-components";
import { cardBoxShadow } from "../styles";

const PopOver = styled.div`
  min-width: 60px;
  min-height: 60px;
  z-index: 20;
  background: ${p => p.theme.colors.bg};
  border: 1px solid ${p => p.theme.colors.uiLineGray};
  border-radius: 5px;
  padding: 1rem;
  ${() => cardBoxShadow}
`

export default PopOver;