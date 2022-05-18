import React, { useMemo } from 'react'
import styled from 'styled-components';

type Props = {
  width: number;
  height: number;
  isClose: boolean;
}

const MenuIcon: React.FC<Props> = ({ width, height, isClose }) => {
  const pos = useMemo(() => {
    const first = 0;
    const middle = (height - 4) / 2 + 1
    const last = height - 2;
    return [first, middle, last]
  }, [height])

  return (
    <Container width={width} height={height}>
      <Line1 size={width} top={pos[0]} className={isClose ? 'is-close' : ''} />
      <Line2 size={width} top={pos[1]} className={isClose ? 'is-close' : ''} />
      <Line3 size={width} top={pos[1]} className={isClose ? 'is-close' : ''} />
      <Line1 size={width} top={pos[2]} className={isClose ? 'is-close' : ''} />
    </Container>
  )
}

const Container = styled.div<{
  width: number,
  height: number
}>`
  width: ${p => p.width}px;
  height: ${p => p.height}px;
  position: relative;
`

const Line = styled.div<{
  size: number,
  top: number,
}>`
  width: ${p => p.size}px;
  background: ${p => p.theme.colors.textPrimary};
  height: 2px;
  position: absolute;
  left:0;
  top:${p => p.top}px;
  transition: all .3s;
`

const Line1 = styled(Line)`
  &.is-close {
    opacity: 0;
  }
`

const Line2 = styled(Line)`
  &.is-close {
    transform: rotate(45deg);
  }
`

const Line3 = styled(Line)`
  &.is-close {
    transform: rotate(-45deg);
  }
`


export default MenuIcon