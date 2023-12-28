
import { DetailedHTMLProps, ImgHTMLAttributes, useState } from "react";
import ImgModel from "./common/img-model";

/**
 * custom img component
 * @param props 
 * @returns 
 */
export function MDImg(props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
  const [isModel, setisModel] = useState(false)

  return <>
    <ImgModel imgProps={props} isModel={isModel} setModel={setisModel} />
    {/*eslint-disable-next-line @next/next/no-img-element*/}{/* eslint-disable-next-line jsx-a11y/alt-text */}
    <img loading="lazy" onClick={() => setisModel(true)} style={{
      cursor: "zoom-in"
    }} {...props} />
  </>
}


/**
 * return Tag component with search handler
 */
export function memoTag(searchHandler?: (text: string, immediateSearch?: boolean) => void) {

  function Tag({ text }: { text: string }) {
    // console.debug("[markdown.tsx] detect tag", text)
    return <span className="tag" onClick={() => {
      if (searchHandler) {
        searchHandler(`#${text}`, true)
      }
    }}>#{text} </span>
  }

  return Tag
}
