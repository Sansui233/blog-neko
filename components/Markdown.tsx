
import { DetailedHTMLProps, ImgHTMLAttributes, useState } from "react";
import styled from "styled-components";
import ImgModel from "./ImgModel";

export function MDImg(props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
  const [isModel, setisModel] = useState(false)

  return <>
    {isModel
      ? <ImgModel imgProps={props} isModel={isModel} setModel={setisModel} />
      : undefined}
    {/*eslint-disable-next-line @next/next/no-img-element*/}{/* eslint-disable-next-line jsx-a11y/alt-text */}
    <img loading="lazy" {...props} onClick={() => setisModel(true)} style={{
      cursor: "zoom-in"
    }}></img>
  </>
}


export const MarkdownStyle = styled.div`
  text-align: justify;

  @media screen and (max-width: 580px){
    text-align: unset;
  }

  img, picture, video, canvas, svg, pre{
    margin: 1.625rem auto;
    display: block;
  }

  p,ul,ol {
    line-height: 1.8rem;
    margin: 1.5rem 0;
  }

  blockquote {
    margin: 1.625rem 0;
  }

  a {
    position: relative;
    font-weight: 500;
    border-bottom: 1px solid ${props => props.theme.colors.gold};
    transition: box-shadow .5s;
  }

  a:hover {
    box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.goldHover};
  }
  
  code {
    background-color: ${props => props.theme.colors.codeBlockBg};
    font-size: 0.95rem;
    border-radius: 3px;
    padding: 0 0.25rem;
    margin: 0 1px;
  }

  pre code {
    font-size: 0.875rem;
    border-radius: unset;
    padding: 1rem 2rem;
    margin: unset;
    overflow: auto;
  }

  blockquote {
    border-left: solid 2px;
    padding-left: 1.875em;
    color: ${props => props.theme.colors.textGray};
  }

  del {
    opacity: .33;
  }

  ul li {
    display: block;
    position: relative;
  }
  ul li::before {
    content:'';
    position: absolute;
    top: .6em;
    height: .4em;
    width: .4em;
    border-radius: 1em;
    border: solid 1px ${p => p.theme.colors.gold};
    left: -1.5rem;
  }

`;
