import { DetailedHTMLProps, ImgHTMLAttributes } from "react"
import { styled } from "styled-components"

type Props = {
  imgProps: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
  isModel: boolean,
  setModel: (isOpen: boolean) => void
}

const ImgModel = ({ imgProps, isModel, setModel }: Props) => {
  return (
    <MaskedContainer $isOpen={isModel} onClick={e => setModel(false)}>
      {/*eslint-disable-next-line @next/next/no-img-element*/} {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img loading="lazy" className="model" {...imgProps} /> {/* add class model for StyledComponents render order */}
    </MaskedContainer>
  )
}

const MaskedContainer = styled.div< { $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: #000000de;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;

  & img.model {
    display:block;
  }

  @media screen and (min-width: 780px) {
    & img.model {
    }
  }

`

export default ImgModel