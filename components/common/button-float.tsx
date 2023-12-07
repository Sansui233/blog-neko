import { LucideIcon } from 'lucide-react'
import React from 'react'
import styled from 'styled-components'

type Props = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  Icon: LucideIcon,
  clickHandler: (e: React.MouseEvent) => void,
}

function ButtonFloat({ Icon, clickHandler, ...otherprops }: Props) {
  return (
    <ButtonContainer onClick={clickHandler} {...otherprops}>
      <Icon size={"1em"} />
    </ButtonContainer>
  )
}

const ButtonContainer = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 1rem;

  height: 3rem;
  width: 3rem;
  font-size: 1.5rem;
  border-radius: 50%;
  border: 0;
  background: ${p => p.theme.colors.floatBg};
  color: ${p => p.theme.colors.textGray2};
  z-index: 10;
  cursor: pointer;

  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    -webkit-transform: translate(-50%,-50%);
  }

  @media (any-hover: hover) {
    &:hover{
      background: ${p => p.theme.colors.accentHover};
      color: ${p => p.theme.colors.textPrimary};
    }
  }

  @media (any-hover: none) {
    &:active{
      background: ${p => p.theme.colors.accentHover};
      color: ${p => p.theme.colors.textPrimary};
    }
  }

`

export default ButtonFloat