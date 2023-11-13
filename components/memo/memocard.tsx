import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import { TMemo } from "../../pages/memos";
import { siteInfo } from "../../site.config";
import { bottomFadeIn } from "../../styles/animations";
import { MarkdownStyle } from "../../styles/components/MarkdownStyle";
import { textShadow } from "../../styles/styles";
import { useMdxMemo } from "../mdx";
import { Images } from "./imagesthumb";


export type MemoCardProps = {
  source: TMemo;
  setSearchText: (text: string, immediateSearch?: boolean) => void;
  triggerHeightChange?: Dispatch<SetStateAction<boolean>>;
} & React.HTMLProps<HTMLElement>

export function MemoCard({ source, setSearchText, triggerHeightChange, ...otherprops }: MemoCardProps) {
  const [isCollapse, setfisCollapse] = useState(true);
  const theme = useContext(ThemeContext);
  const ref = React.useRef<HTMLDivElement>(null);

  const shouldCollapse = source.length > 200 ? true : false;

  function handleExpand(e: React.MouseEvent<HTMLDivElement>) {
    // Set Collapse
    if (!isCollapse) {
      const element = ref.current;
      if (element) {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < 0 || elementTop > window.innerHeight) {
          globalThis.scrollTo({
            top: elementTop + globalThis.scrollY,
          });
        }
      }
    }
    setfisCollapse(!isCollapse);

    // height change
    if (ref.current && triggerHeightChange) {
      triggerHeightChange(true)
    }
  }

  return (
    <MemoCardStyle {...otherprops} $isCollapse={shouldCollapse === false ? false : isCollapse} ref={ref}>
      <div className="content">
        <MemoMeta>
          {/*eslint-disable-next-line @next/next/no-img-element*/}
          <img className="avatar" src={theme!.assets.favico} alt={siteInfo.author} />
          <div className="meta">
            <div>{siteInfo.author}</div>
            <div className="date">
              {source.id}&nbsp;&nbsp;
              <span className="word-count">{source.length}&nbsp;字</span>
            </div>
          </div>
        </MemoMeta>
        <MemoMarkdown $bottomSpace={shouldCollapse}>
          {useMdxMemo(source.code, setSearchText)}
        </MemoMarkdown>
        <CardMask $isCollapse={isCollapse} $isShown={shouldCollapse}>
          <div onClick={handleExpand} className="rd-more">
            <span>{isCollapse ? "SHOW MORE" : "Hide"}</span>
          </div>
        </CardMask>
      </div>
      <div style={{ padding: "0 0.5rem" }}>
        <Images imgsmd={source.imgsmd} />
      </div>

    </MemoCardStyle>
  );
}


const MemoCardStyle = styled.section<{
  $isCollapse: boolean
}>`

  background:${p => p.theme.colors.bg};
  margin: 0.5rem 0;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  animation: ${bottomFadeIn} 1s ease;

  @media screen and (max-width: 780px) {
    padding: 1.25rem 1.5rem;
  }

  @media screen and (max-width: 580px) {
    padding: 1.25rem 1rem;
    border-radius: unset;
  }
  
  & > .content {
    position: relative;
    height: ${props => props.$isCollapse === true ? "19rem" : "auto"};
    overflow: hidden;
    /* transition: height 0.5s ease; */
  }
`


const CardMask = styled.div<{
  $isCollapse: boolean,
  $isShown: boolean
}>`
    display: ${props => props.$isShown === true ? "block" : "none"};
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 7rem;
    text-align: right;
    
    color: ${p => p.theme.colors.accent};
    ${props => props.$isCollapse === true ? props.theme.colors.maskGradient : ''}

    .rd-more {
      margin-top: 5.375rem;
      font-size: 0.875rem;
      letter-spacing: 0.02rem;
      padding: 0.2rem 0;
      cursor: pointer;
      span {
        transition: box-shadow .3s;
      }
    }

    & .rd-more:hover span {
      ${() => textShadow.f}
    }
   
`

const MemoMarkdown = styled(MarkdownStyle) <{
  $bottomSpace: boolean,
}>`
    padding-left: 5px;

    @media screen and (min-width: 580px){
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }

    padding-bottom: ${props => props.$bottomSpace === true ? "2rem" : "inherit"};
    
    h1,h2,h3,h4,h5,h6 {
      font-size: 1rem;
    }

    & .tag {
      color: ${p => p.theme.colors.accent};
    }

    & .tag:hover {
      cursor: pointer;
      color: ${p => p.theme.colors.accentHover};
    }
`

const MemoMeta = styled.div`
    display: flex;

    & > .avatar {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      border: 1px solid ${p => p.theme.colors.uiLineGray};

      @media screen and (max-width: 580px){
        width: 2.75rem;
        height: 2.75rem;
      }

    }

    & .meta{
      margin-left: 0.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    & .date {
      font-size: 0.85rem;
      color: ${p => p.theme.colors.textGray};
    }

    & .word-count {
      position: absolute;
      right: 0;
    }
`
