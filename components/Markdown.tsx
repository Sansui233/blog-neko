
import { DetailedHTMLProps, ImgHTMLAttributes, useState } from "react";
import styled from "styled-components";
import { linkHoverBS } from "../styles/styles";
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
    ${linkHoverBS}
  }
  
  code {
    color: ${props => props.theme.colors.gold};
    background-color: ${props => props.theme.colors.codeBlockBg};
    font-size: 0.875rem;
    border-radius: 3px;
    padding: 0.375rem 0.375rem;
    margin: 0rem 1px;
  }

  pre code {
    color: ${p => p.theme.colors.textPrimary};
    border-radius: unset;
    padding: 1rem 2rem;
    margin: unset;
    overflow: auto;
  }

  blockquote {
    border-left: solid 2px;
    padding-left: 1.5em;
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

  .hljs {
    background: ${p => p.theme.colors.codeBlockBg};
  }
  
  .hljs-emphasis {
    font-style: italic;
  }
  
  .hljs-strong {
    font-weight: bold;
  }
  
  .hljs-link {
    text-decoration: underline;
  }
  
  .hljs-comment,
  .hljs-quote {
    color: #878ea7ba;
    font-style: italic;
  }
  
  .hljs-params,
  .hljs-type {
    color: #878ea7ba;
  }
  
  .hljs-punctuation,
  .hljs-attr {
    color: rgb(89 161 197);
  }
  
  .hljs-selector-tag,
  .hljs-name,
  .hljs-meta,
  .hljs-operator,
  .hljs-char.escape_ {
    color: #c56200;
  }
  
  .hljs-keyword,
  .hljs-deletion {
    color: ${p => p.theme.colors.gold};
  }
  
  .hljs-regexp,
  .hljs-selector-pseudo,
  .hljs-selector-attr,
  .hljs-variable.language_ {
    color: #cc5e91;
  }
  
  .hljs-subst,
  .hljs-property,
  .hljs-code,
  .hljs-formula,
  .hljs-section,
  .hljs-title.function_ {
    color: #d14f82;
  }
  
  .hljs-string,
  .hljs-symbol,
  .hljs-bullet,
  .hljs-addition,
  .hljs-selector-class,
  .hljs-title.class_,
  .hljs-title.class_.inherited__,
  .hljs-meta .hljs-string {
    color: #c68032;
  }
  
  .hljs-variable,
  .hljs-template-variable,
  .hljs-number,
  .hljs-literal,
  .hljs-link,
  .hljs-built_in,
  .hljs-title,
  .hljs-selector-id,
  .hljs-tag,
  .hljs-doctag,
  .hljs-attribute,
  .hljs-template-tag,
  .hljs-meta .hljs-keyword {
    color: #9080ff;
  }

`;
