import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import styled from "styled-components";
import { Naive, Result } from '../lib/search';
import { SearchObj } from '../lib/search/common';
import { debounce } from '../lib/throttle';
import PopOver from '../styles/components/PopOver';

const SEARCHDOC = '/data/posts/index.json'

type Props = {
  outSetSearch: (isShow: boolean) => void
  stateToInner: boolean
  iconEle: React.RefObject<HTMLDivElement> // 这个组件有从内部控制外部，但外部的搜索图标是随便放的，在判断点击外部区部时要排除
}


function SearchBox({ outSetSearch: outShow, stateToInner: outstate, iconEle }: Props) {
  const [idx, setidx] = useState<Naive<Result>>()
  const [res, setres] = useState<Result[]>([])
  const [isShow, setIsShow] = useState(outstate)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isReady, setisReady] = useState(false)

  const toggle = useCallback((b: boolean) => {
    outShow(b) // to outside
    setIsShow(b) // inside
  }, [outShow])

  useEffect(() => {
    setIsShow(outstate)
  }, [outstate])


  // fetch
  useEffect(() => {
    fetch(SEARCHDOC)
      .then(res => res.json())
      .then((data) => {
        const newIdx = new Naive({
          data: data as Required<SearchObj>[],
          ref: "id",
          field: ["title", "description", "keywords", "content"],
          notifier: setres
        })

        setidx(newIdx)
        setisReady(true)
      })
  }, [])

  // Click Outside to close
  // Esc to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // https://developer.mozilla.org/en-US/docs/Web/API/Node inherit from EventTarget
      const clickSearchBox = containerRef.current && containerRef.current.contains((e.target as Node))
      const clickSearchIcon = iconEle.current && iconEle.current?.contains((e.target as Node))
      if (!clickSearchBox && !clickSearchIcon) {
        toggle(false)
      }
    }

    document.addEventListener('mousedown', (e) => handleClick(e), false);

    function close(e: KeyboardEvent) {
      if (e.key === "Escape") {
        toggle(false)
      }
    }
    document.addEventListener('keydown', (e) => { close(e) }, false)

    return () => {
      document.removeEventListener('mousedown', (e) => handleClick(e), false);
      document.removeEventListener('keydown', (e) => { close(e) }, false)
    }
  }, [iconEle, toggle])

  // Focus on open
  useEffect(() => {
    if (isShow) {
      inputRef.current?.focus()
    }
  }, [isShow])

  const handleInput = debounce(function (e: FormEvent<HTMLInputElement>) {
    const strs = (e.target as HTMLInputElement).value.split(" ")
    inputRef.current && idx?.search(strs)
  }, 300)

  const renderResult = function () {
    // 列表太长了要做成infinte scroll，不然修改打分机制

    if (!isReady) {
      return <div style={{ fontSize: "0.875rem", opacity: 0.5 }}>
        <Excerpt>搜索初始化中……</Excerpt>
      </div>
    }

    if (res.length === 0) {
      return <></>
    }

    return res.map((r, i) => {
      const id = r.ref.substring(0, r.ref.lastIndexOf(".")); // remove suffix
      return <Item href={`/posts/${id}`} key={i} onClick={() => { toggle(false) }}>
        <span>{highlightSlot(r.title, r.matches?.map(e => e.word))}</span>
        {r.matches?.map(
          e => e.excerpt ? <Excerpt key={e.word}>{highlightSlot(e.excerpt, e.word)}</Excerpt> : undefined
        )}
      </Item>
    })

  }

  function highlightSlot(s: string, patterns: string | string[] | undefined) {
    if (!patterns) return s

    if (typeof patterns === "string") {
      patterns = [patterns]
    }

    const regexPattern = new RegExp(`(${patterns.join('|')})`, 'gi');
    const matches = s.split(regexPattern);

    return (
      <>
        {matches.map((match, index) => {

          if (regexPattern.test(match)) {
            return <mark key={index}>{match}</mark>;
          } else {
            return <span key={index}>{match}</span>;
          }

        })}
      </>
    );

  }


  return (
    <Container ref={containerRef} className={isShow ? "" : "hidden"}>
      <StickyContainer style={{ padding: "1rem 1rem 0 1rem" }}>
        <Input type="text" placeholder="搜索你感兴趣的内容，以空格分词" ref={inputRef} onInput={handleInput} />
      </StickyContainer>
      <ScrollContainer style={{ padding: "0.5rem 1rem " }}>
        {renderResult()}
      </ScrollContainer>
    </Container>
  )
}

const ScrollContainer = styled.div`
  overflow-y: scroll;
  max-height: 60vh;
`

const StickyContainer = styled.div`
  position: sticky;
  top: 0;
  background: ${p => p.theme.colors.bg};
`

const Input = styled.input`
  border: none;
  /*border-bottom: 1px solid ${p => p.theme.colors.uiLineGray};*/
  border-radius: 0;
  background: ${p => p.theme.colors.bg};
  width: 100%;
  color: ${p => p.theme.colors.textPrimary};


  &:focus,
  &:focus-visible{
    outline: none;
    /*border-bottom: 1px solid ${p => p.theme.colors.goldHover};*/
  }
`

const Item = styled(Link)`
  padding: 0.375rem 0;
  display: block;
  padding-left: 1rem;

  
  &:hover>span{
    box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.goldHover};
  }

  &>span {
    transition: box-shadow .5s;
    position: relative;
  }

  &>span::before {
    content: "•";
    color: ${p => p.theme.colors.gold};
    left: -0.875rem;
    position: absolute;
  }
  
`

const Excerpt = styled.div`
  font-size: 0.875rem;
  color: ${p => p.theme.colors.textGray};
  overflow: hidden;
  white-space: nowrap;
  wrap: no-wrap;
`

const Container = styled(PopOver)`
  min-height: unset;
  position: fixed;
  top: 55px;
  right: 0px;
  width: 24rem;
  overflow: hidden;
  margin: 0 10px;


  &.hidden {
    display: none;
  }
  
  & mark {
    background: none;
    color: ${p => p.theme.colors.gold}
  }

  @media screen and (max-width: 580px){
    width: 96%;
    max-height:50%
  }
  
`


export default SearchBox
