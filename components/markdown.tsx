
import { CSSProperties, DetailedHTMLProps, ImgHTMLAttributes, LegacyRef, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useDocumentEvent } from "../lib/use-event";
import { useViewHeight, useViewWidth } from "../lib/use-view";
import { LoaderAnimation } from "../styles/animations";

/**
 * custom img component
 * @param props 
 * @returns 
 */
export function MDImg(props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
  const [isModel, setisModel] = useState(false)
  const [isLoading, setisLoading] = useState(true)
  const imgRef: LegacyRef<HTMLImageElement> | undefined = useRef(null);
  const containerRef: LegacyRef<HTMLSpanElement> | undefined = useRef(null);
  const [ghostStyle, setGhostStyle] = useState<CSSProperties & {
    width: string,
    height: string
  }>({ width: '0px', height: '0px', opacity: 0 });
  const [imgStyle, setImgStyle] = useState<CSSProperties>({ opacity: 1 });

  const vw = useViewWidth()
  const vh = useViewHeight()

  // Set ghost wrapper's width and height after image loaded
  useEffect(() => {
    if (!imgRef.current) return
    const handleImageLoaded = () => {
      if (imgRef.current && containerRef.current) {
        const img = imgRef.current.getBoundingClientRect()
        const ghost = containerRef.current.getBoundingClientRect()
        const transX = img.x - ghost.x
        setGhostStyle(s => {
          return {
            ...s,
            width: img.width + "px",
            height: img.height + "px",
            transform: `translateX(${transX}px)`
          }
        });
        setisLoading(false)
      }
    };
    const handleImageError = () => {
      setisLoading(false)
    };

    const elem = imgRef.current;
    if (elem.complete) {
      handleImageLoaded();
    } else {
      // Otherwise, wait for the image to load
      elem.onload = handleImageLoaded;
      elem.onerror = handleImageError;
    }
    return () => {
      elem.onload = null;
      elem.onerror = null;
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
    if (isModel && imgRef.current && containerRef.current) {
      const img = imgRef.current.getBoundingClientRect()
      const ctn = containerRef.current.getBoundingClientRect()
      const transX = img.x - ctn.x
      // hide model
      setGhostStyle(s => {
        return {
          ...s,
          transform: `scale(1) translateX(${transX}px)`,
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
    } else if (imgRef.current && containerRef.current) {
      // show
      const img = imgRef.current.getBoundingClientRect()
      const ctn = containerRef.current.getBoundingClientRect()
      const width = img.width
      const height = img.height
      const transY = -(img.y - vh / 2 + height / 2)
      const transX = img.x - 2 * ctn.x - ctn.width / 2 + vw / 2

      const scale = Math.min(vw / width, vh / height)
      setGhostStyle(s => {
        return {
          ...s,
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

  return <FluidWrap ref={containerRef}>
    {/* <ImgModel imgProps={props} isModel={isModel} setModel={setisModel} /> */}
    {isLoading && <FluidLoader>
      <span></span>
    </FluidLoader>}
    {/*eslint-disable-next-line @next/next/no-img-element*/}{/* eslint-disable-next-line jsx-a11y/alt-text */}
    <img ref={imgRef} loading="lazy" onClick={handleClick} style={{
      ...imgStyle,
      cursor: "zoom-in"
    }} {...props} />
    <FluidGhost style={{
      backgroundImage: `url(${props.src})`,
      ...ghostStyle
    }} onClick={handleClick}></FluidGhost>

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

const FluidWrap = styled.span`
  display: block;
  position: relative;
  text-align: center;
  background-position: 50%;
  background-size: cover;
  transition: all .25s ease-in-out;
`

const FluidGhost = styled.span`
  position: absolute;
  display: block;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: zoom-out;
  z-index: 11;
  transition: transform ease 0.3s;
  border-radius: 1rem;
  background-position: 50%;
  background-size: cover;
`

const FluidLoader = styled.span`
/* HTML: <div class="loader"></div> */
  display: flex;
  position: absolute;
  top: 0px;
  span {
    padding: 10px;
    width: 120px;
    height: 20px;
    background: linear-gradient(#000 0 0) left/20px 20px no-repeat #ddd;
    animation: ${LoaderAnimation} 1s infinite linear;
  }
  pointer-events: none;
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
