
import { CSSProperties, DetailedHTMLProps, ImgHTMLAttributes, LegacyRef, useCallback, useEffect, useRef, useState } from "react";
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
  const ghostRef: LegacyRef<HTMLImageElement> | undefined = useRef(null);
  const [ghostStyle, setGhostStyle] = useState<CSSProperties & {
    width: string,
    height: string
  }>({ width: '0px', height: '0px', opacity: 0 });
  const [imgStyle, setImgStyle] = useState<CSSProperties>({ opacity: 1 });

  const vw = useViewWidth()
  const vh = useViewHeight()

  // Set ghost wrapper's width and height after image loaded
  useEffect(() => {
    if (!imgRef.current || !ghostRef.current) return
    const handleImageLoaded = () => {
      if (imgRef.current && ghostRef.current) {
        const img = imgRef.current.getBoundingClientRect()
        setImgStyle(s => {
          return {
            minHeight: "unset",
            minWidth: "unset",
            background: "unset",
          }
        })
        setGhostStyle(s => {
          return {
            ...s,
            width: img.width + "px",
            height: img.height + "px"
          }
        });
      }
    };

    const elem = imgRef.current;
    if (elem.complete) {
      handleImageLoaded();
    } else {
      // Otherwise, wait for the image to load
      elem.onload = handleImageLoaded;
    }
    return () => {
      elem.onload = null;
    };
  }, []); // re-calc when view width changed

  useDocumentEvent("scroll", () => {
    if (isModel) {
      setisModel(false)
      handleClick()
    }
  }, false, [isModel])

  /**
   * with UX animation
   */
  const handleClick = useCallback(() => {
    if (isModel) {
      // hide model
      setGhostStyle(s => {
        return {
          ...s,
          transform: `scale(1) `,
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
        setGhostStyle(s => {
          return {
            ...s,
            opacity: 0,
          }
        })
      }, 400)
    } else if (imgRef.current) {
      // show
      const img = imgRef.current.getBoundingClientRect()
      const width = img.width
      const height = img.height
      const transY = -(img.y - vh / 2 + height / 2)
      const transX = -(img.x - vw / 2 + width / 2)
      const scale = Math.min(vw / width, vh / height)
      setGhostStyle(() => {
        return {
          width: width + "px",
          height: height + "px",
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
    } else {
      console.error("[Error] img nothing happened, ref not inited")
    }
    setisModel(!isModel)
  }, [isModel, vh, vw])

  return <FluidWrap>
    {/* <ImgModel imgProps={props} isModel={isModel} setModel={setisModel} /> */}
    {/*eslint-disable-next-line @next/next/no-img-element*/}{/* eslint-disable-next-line jsx-a11y/alt-text */}
    <img ref={imgRef} loading="lazy" onClick={handleClick} style={{
      ...imgStyle,
      cursor: "zoom-in",
      minHeight: "2rem",
      minWidth: "3rem",
      background: "#88888833",
    }} {...props} />
    <span style={{
      ...ghostStyle,
      display: "block",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      cursor: "zoom-out",
      zIndex: 10
    }} onClick={handleClick}></span>

    {/* bg layer */}
    <span onClick={handleClick} style={{

      display: isModel ? "block" : "none",
      position: "fixed",
      backdropFilter: "blur(10px)",
      top: 0,
      left: 0,
      WebkitBackdropFilter: "blur(10px)",
      right: 0,
      bottom: 0,
      cursor: "zoom-out",
      zIndex: 10
    }}></span>
  </FluidWrap>
}

const FluidWrap = styled.p`
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
