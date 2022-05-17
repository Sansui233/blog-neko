import { useEffect, useState } from "react"
import styled from "styled-components"

type Props = {
  // 如果有需要可以适配其他类型，还有高度字号什么的。自用组件就算了不写这么多
  items: [string, number][] // Name and Value
  current: number
  setCurrent: (num: number) => void
}
export function NavDropper({ items, current, setCurrent }: Props) {
  const [isOpen, setisOpen] = useState(false)
  function toggleOpen(open = true) {
    setisOpen(open)
  }

  return (
    <NavLayout
      onMouseLeave={() => { toggleOpen(false) }}
      onTouchStart={() => { toggleOpen(!isOpen) }}>
      <MainItem>
        <span onMouseEnter={() => { toggleOpen(true) }} className={isOpen ? "is-open" : ''}>
          {items[current][0]}({items[current][1]}) ▼
        </span>
      </MainItem>
      <SubItemContainer className={isOpen ? "is-open" : ''}>
        {items.map((item, i) => (
          <NavItem key={i} onClick={() => { setCurrent(i); setisOpen(false) }}>
            <span>{item[0]}({item[1]})</span>
          </NavItem>
        ))}
      </SubItemContainer>
    </NavLayout>)
}


const NavLayout = styled.nav`
  text-align: right;
  position: relative;
  padding: 2rem 0 1rem 0;
`
const SubItemContainer = styled.div`
  position: absolute;
  right:0;
  opacity: 0;
  pointer-events: none;
  margin-top: .625rem;
  border-right: 2px solid;
  padding-left: 2.5rem;
  transform: none;
  ${props => props.theme.colors.navBgGradient};
  transform: translateY(-0.5rem);
  transition: opacity .5s ease, transform .5s ease;

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
    box-shadow: inset 0 -1px 0 ${props => props.theme.colors.textGray};
  }
`

const MainItem = styled.div`
  font-weight: bold;
  transform: translateX(.3em);
  span {
    cursor: pointer;
    box-shadow: inset 0 0 0 ${props => props.theme.colors.hoverBg};
    transition: box-shadow 0.5s ease;
  }
  span:hover {
    box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.hoverBg};
  }
  span.is-open {
    box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.hoverBg};
  }
`