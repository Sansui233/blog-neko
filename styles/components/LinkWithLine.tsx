import Link from 'next/link'
import styled from 'styled-components'
import { linkHoverBS } from '../styles'

const LinkWithLine = styled(Link)`
  position: relative;
  font-weight: bold;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: -3px;
    width: 0;
    height: 2px;
    background: ${props => props.theme.colors.gold};
    transition: width 1s cubic-bezier(0.34, 0.04, 0.03, 1.4), background .3s;
  }
  
  &:hover::before {
    width: 100%;
  }
`

const HoverWithLine = styled.span`
  position: relative;
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: -3px;
    width: 0;
    height: 2px;
    background: ${props => props.theme.colors.gold};
    transition: width 1s cubic-bezier(0.34, 0.04, 0.03, 1.4), background .3s;
  }

  &:hover::before {
    width: 100%;
  }
`

const HoverWithBoxShadow = styled.span`

  position: relative;
  border-bottom: 1px solid ${props => props.theme.colors.gold};
  transition: box-shadow .5s;
  cursor: pointer;


  &:hover {
    ${linkHoverBS}
  }

`

export { HoverWithBoxShadow, HoverWithLine, LinkWithLine }
