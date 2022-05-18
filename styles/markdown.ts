import styled from "styled-components";

export const MarkdownStyle = styled.div`
  text-align: justify;

  @media screen and (max-width: 580px){
    text-align: unset;
  }

  img, picture, video, canvas, svg, pre{
    margin: 1.625rem 0;
  }

  p,ul,ol {
    line-height: 1.8em;
  }

  a {
    position: relative;
    font-weight: 600;
  }

  a::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: -0.125em;
    width: 100%;
    height: 0;
    background: ${props => props.theme.colors.hoverBg};
    border-bottom: 1px solid gray;
    transition: height .5s ease;
  }
  
  a:hover::before {
    height: 1.25em;
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
  }

  blockquote {
    border-left: solid 2px;
    padding-left: 1.875em;
    color: ${props => props.theme.colors.textGray};
  }

  del {
    opacity: .33;
  }

`;
