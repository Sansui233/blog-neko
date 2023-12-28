import { ChevronDown } from "lucide-react";
import { useState } from "react";
import styled from "styled-components";
import { hoverRound } from "../../styles/css";

type Props = {
  // 如果有需要可以适配其他类型，还有高度字号什么的。自用组件就算了不写这么多
  items: [string, number][] // Name and Value
  current: number
  setCurrent: (num: number) => void
}
export default function NavDropper({ items, current, setCurrent }: Props) {
  const [isOpen, setisOpen] = useState(false)

  return (
    <NavLayout
      onClick={() => { setisOpen(!isOpen) }}>
      <MainItem>
        <span className={isOpen ? "is-open" : ''}>
          {items[current][0]}{' '}{items[current][1]}
        </span>
        <ChevronDown className={isOpen ? "is-open" : ''} strokeWidth="1px" />
      </MainItem>
      <SubItemContainer className={isOpen ? "is-open" : ''}>
        {items.map((item, i) => (
          <NavItem key={i} onClick={() => { setCurrent(i); setisOpen(false) }}>
            <span>{item[0]}{' '}{item[1]}</span>
          </NavItem>
        ))}
      </SubItemContainer>
    </NavLayout>)
}


const NavLayout = styled.nav`
  text-align: right;
  position: relative;
  padding: 2rem 0;
`
const SubItemContainer = styled.div`
  position: absolute;
  right:0;
  opacity: 0;
  pointer-events: none;
  margin-top: .625rem;
  margin-right: 4px;
  border-right: 2px solid ${props => props.theme.colors.accentHover};
  padding-left: 2.5rem;
  transform: none;
  ${props => props.theme.colors.navBgGradient};
  transform: translateY(-0.5rem);
  transition: opacity .3s ease, transform .3s ease;

  &.is-open {
    z-index: 1;
    opacity: 1;
    transform: translate(0);
    pointer-events: auto;
  }
`
const NavItem = styled.div`
  font-size: 0.875rem;
  padding: 0.3em .6em;
  cursor: pointer;
  position: relative;
  &:hover span{
    color: ${props => props.theme.colors.accent};
  }
`

const MainItem = styled.div`
  cursor: pointer;

  span {
    position: relative;
  }

  span::before {
    ${hoverRound}
    height: 2px;
    transition: height .3s;
  }

  span.is-open::before {
    height: 0.4em;
  }

  svg {
    transition: transform .3s;
    margin-right: -0.4em;
    margin-top: -2px;
    margin-left: 2px;
  }

  svg.is-open {
    transform: rotateX(180deg);
  }

`