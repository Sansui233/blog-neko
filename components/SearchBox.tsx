import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import styled from "styled-components";
import { Naive, Result } from '../lib/search';
import { SearchObj } from '../lib/search/common';
import { debounce } from '../lib/throttle';
import PopOver from '../styles/components/PopOver';

const SEARCHDOC = '/data/posts/index.json'

type Props = {
  ourSetSearch: (isShow: boolean) => void
  stateToInner: boolean
  iconEle: React.RefObject<HTMLDivElement> // 这个组件有从内部控制外部，但外部的搜索图标是随便放的，在判断点击外部区部时要排除
}


function SearchBox({ ourSetSearch: outShow, stateToInner: outstate, iconEle }: Props) {
  const [idx, setidx] = useState<Naive<Result>>()
  const [res, setres] = useState<Result[]>([])
  const [isShow, setIsShow] = useState(outstate)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isReady, setisReady] = useState(false)

  const toggle = (b: boolean) => {
    outShow(b) // to outside
    setIsShow(b) // inside
  }

  useEffect(() => {
    setIsShow(outstate)
  }, [outstate])


  // fetch
  useEffect(() => {
    fetch(SEARCHDOC)
      .then(res => res.json())
      .then((data) => {
        const newIdx = new Naive({
          data: data as SearchObj[],
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
        console.log('press')
        toggle(false)
      }
    }
    document.addEventListener('keydown', (e) => { close(e) }, false)

    return () => {
      document.removeEventListener('mousedown', (e) => handleClick(e), false);
      document.removeEventListener('keydown', (e) => { close(e) }, false)
    }
  }, [])

  // Focus on open
  useEffect(() => {
    if (isShow) {
      inputRef.current?.focus()
    }
  }, [isShow])

  const handleInput = debounce(function (e: FormEvent<HTMLInputElement>) {
    inputRef.current && idx?.search((e.target as HTMLInputElement).value)
  }, 300)

  const renderResult = function () {
    // 列表太长了要做成infinte scroll，不然修改打分机制
    const spacer = <div style={{ height: "0.5rem" }} />

    if (!isReady) {
      return <div style={{ fontSize: "0.875rem", opacity: 0.5 }}>{spacer}
        <Excerpt>搜索初始化中……</Excerpt>
      </div>
    }

    if (res.length === 0) {
      return <div style={{ fontSize: "0.875rem", opacity: 0.5 }}>{spacer}</div>
    }

    return res.map((r, i) => {
      const id = r.ref.substring(0, r.ref.lastIndexOf(".")); // remove suffix
      return <Item key={i} >
        {i === 0 ? spacer : undefined}
        <Link href={`/posts/${id}`}>{highlightSlot(r.title, r.matched)}</Link>
        <Excerpt>{r.excerpt ?
          highlightSlot(r.excerpt, r.matched)
          : undefined}</Excerpt>
      </Item>
    })

  }

  function highlightSlot(s1: string, pattern: string) {
    const regex = new RegExp(`(${pattern})`, 'gi');
    const parts = s1.split(regex);

    return (
      <>
        {parts.map((part, index) => (
          regex.test(part) ? <mark key={index}>{part}</mark> : part // 好牛逼的写法，但速度不如for
        ))}
      </>
    );

  }


  return (
    <Container ref={containerRef} className={isShow ? "" : "hidden"}>
      <Input type="text" placeholder="关键词搜索" ref={inputRef} onInput={handleInput} />
      {renderResult()}
    </Container>
  )
}

const Input = styled.input`
  border: none;
  border-bottom: 1px solid ${p => p.theme.colors.uiLineGray};
  background: ${p => p.theme.colors.bg};
  width: 100%;
  color: ${p => p.theme.colors.textPrimary};

  &:focus,
  &:focus-visible{
    outline: none;
    border-bottom: 1px solid ${p => p.theme.colors.goldHover};
  }
`

const Item = styled.div`
  padding: 0.2rem 0;
  cursor: pointer;

  
  &:hover a{
    box-shadow: inset 0 -0.5em 0 ${props => props.theme.colors.goldHover};
  }
  
  a {
    transition: box-shadow .5s;
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
  position: fixed;
  top: 55px;
  right: 10px;
  max-width: 24rem;

  &.hidden {
    display: none;
  }
  
  & mark {
    background: none;
    color: ${p => p.theme.colors.gold}
  }

  @media screen and (max-width: 580px){
    width: 96%;
  }
  
`


export default SearchBox
