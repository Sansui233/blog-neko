
import { CSSProperties, DetailedHTMLProps, ImgHTMLAttributes, LegacyRef, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useDocumentEvent } from "../lib/use-event";
import { useViewHeight, useViewWidth } from "../lib/use-view";

/**
 * custom img component
 * @param props 
 * @returns 
 */
export function MDImg(props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
  const [isModel, setisModel] = useState(false)
  const imgRef: LegacyRef<HTMLImageElement> | undefined = useRef(null);
  const [ghostStyle, setGhostStyle] = useState<CSSProperties & {
    width?: string,
    height?: string
  }>({ opacity: 0 });
  const [imgStyle, setImgStyle] = useState<CSSProperties>({ opacity: 1 });

  const vw = useViewWidth()
  const vh = useViewHeight()

  // Set ghost wrapper's width and height after image loaded
  useEffect(() => {
    if (!imgRef.current) return
    const handleImageLoaded = () => {
      if (imgRef.current) {
        const img = imgRef.current.getBoundingClientRect()
        setGhostStyle({
          width: img.width + "px",
          height: img.height + "px",
        });
      }
    };

    const elem = imgRef.current;
    if (elem.complete) {
      handleImageLoaded();
    }
    return
  }, [vw]); // re-calc when view width changed

  useDocumentEvent("scroll", () => {
    if (isModel) {
      setisModel(false)
      handleClick()
    }
  })

  /**
   * with UX animation
   */
  const handleClick = () => {
    if (isModel) {
      // hide model
      setGhostStyle(dim => {
        return {
          ...dim,
          transform: "scale(1)",
        }
      })
      // ending animation series
      // 300ms
      setTimeout(() => {
        setImgStyle(s => {
          return {
            ...s,
            opacity: 1
          }
        })
      }, 300)
      // 400ms
      setTimeout(() => {
        setGhostStyle(dim => {
          return {
            ...dim,
            opacity: 0,
          }
        })
      }, 400)
    } else if (ghostStyle.width && ghostStyle.height && imgRef.current) {
      // show
      const width = parseFloat(ghostStyle.width.slice(0, -2))
      const height = parseFloat(ghostStyle.height.slice(0, -2))
      const transY = -(imgRef.current.getBoundingClientRect().y - vh / 2 + height / 2)
      const transX = -(imgRef.current.getBoundingClientRect().x - vw / 2 + width / 2)
      const scale = Math.min(vw / width, vh / height)
      setGhostStyle(dim => {
        return {
          ...dim,
          opacity: 1,
          transform: `translateX(${transX}px) translateY(${transY}px) scale(${scale})`,
          zIndex: 11,
        }
      })
      setImgStyle(s => {
        return {
          ...s,
          opacity: 0
        }
      })
    }
    setisModel(!isModel)
  }

  return <FluidWrap>
    {/* <ImgModel imgProps={props} isModel={isModel} setModel={setisModel} /> */}
    {/*eslint-disable-next-line @next/next/no-img-element*/}{/* eslint-disable-next-line jsx-a11y/alt-text */}
    <img ref={imgRef} loading="lazy" onClick={handleClick} style={{
      ...imgStyle,
      cursor: "zoom-in",
    }} {...props} />
    <div style={{
      ...ghostStyle,
      position: "absolute",
      top: 0,
      cursor: isModel ? "zoom-out" : "zoom-in",
      borderRadius: isModel ? 0 : "1rem",
      backgroundImage: `url("${props.src}")`,
      backgroundPosition: "50%",
      backgroundSize: "cover",
      transition: "transform ease 0.3s",
    }} onClick={handleClick} />
    {isModel && <div onClick={handleClick} style={{
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      zIndex: 10,
      // background: "#000000cd",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      cursor: "zoom-out"
    }} />}

  </FluidWrap>
}

const FluidWrap = styled.div`
  position: relative;
  background-position: 50%;
  background-size: cover;
  transition: all .25s ease-in-out;
`


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
