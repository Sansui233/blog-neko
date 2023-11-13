import styled from "styled-components";
import { linkHoverBS } from "../styles";


export const MarkdownStyle = styled.div`
  color: ${p => p.theme.colors.textSecondary};
  
  img, picture, video, canvas, svg, pre{
    margin: 1.5rem auto;
    display: block;
  }

  p,
  ul,
  ol {
    line-height: 1.7rem;
  }

  blockquote {
    margin: 1.5rem 0;
  }

  a {
    position: relative;
    font-weight: bold;
    border-bottom: 1px solid ${props => props.theme.colors.gold};
    transition: box-shadow .5s;
  }

  a:hover {
    ${linkHoverBS}
  }
  
  code {
    color: ${props => props.theme.colors.gold};
    background-color: ${props => props.theme.colors.codeBlockBg};
    border-radius: 3px;
    padding: 0.2rem 0.375rem;
    margin: 0rem 1px;
    font-size: 0.875rem;
  }

  pre code {
    color: ${p => p.theme.colors.textSecondary};
    border-radius: 0.5rem;
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
    content:"•";
    position: absolute;
    color: ${p => p.theme.colors.gold};
    left: -1rem;
  }

  @media screen and (min-width: 580px){

    letter-spacing: 0.01em;
    text-align: justify;

    img, picture, video, canvas, svg, pre{
      margin: 1.6rem auto;
      display: block;
    }

    blockquote {
      margin: 1.6rem 0;
    }
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
    color: #a79b87ba;
    font-style: italic;
  }

  .hljs-params,
  .hljs-type {
    color: #a79b87c4;
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
    color: #799f67;
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
    color: #e36b6b;
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
    color: ${p => p.theme.colors.gold};
  }

`;
