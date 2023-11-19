import { DetailedHTMLProps, ImgHTMLAttributes } from "react"
import Model from "./model"

type Props = {
  imgProps: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
  isModel: boolean,
  setModel: (isOpen: boolean) => void
}

export default function ImgModel({ imgProps, isModel, setModel }: Props) {

  return (
    <Model isModel={isModel} setModel={setModel}>
      {/*eslint-disable-next-line @next/next/no-img-element*/} {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img loading="lazy" {...imgProps} style={{ maxWidth: "100%", maxHeight: "100%", display: "block" }} /> {/* add class model for StyledComponents render order */}
    </Model>
  )
}