import { FormEvent, useEffect, useRef, useState } from 'react';
import styled from "styled-components";
import { Naive, Result } from '../lib/search';
import { SearchObj } from '../lib/search/common';
import { debounce } from '../lib/throttle';

const SEARCHDOC = '/data/posts/index.json'

type Props = {
  ourSetSearch: (isShow: boolean) => void
  stateToInner: boolean
  iconEle: React.RefObject<HTMLDivElement> // 这个组件有从内部控制外部，但外部的搜索图标是随便放的，所以需要传入
}


function SearchBox({ ourSetSearch: outShow, stateToInner: outstate, iconEle }: Props) {
  const [idx, setidx] = useState<Naive<Result>>()
  const [res, setres] = useState<Result[]>([])
  const [isShow, setIsShow] = useState(outstate)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
          field: ["title", "content"],
          notifier: setres
        })

        setidx(newIdx)
      })
  }, [])

  // Click Outside to close
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

    return () => {
      document.removeEventListener('mousedown', (e) => handleClick(e), false);
    }
  }, [])

  const handleInput = debounce(function (e: FormEvent<HTMLInputElement>) {
    inputRef.current && idx?.search((e.target as HTMLInputElement).value)
  }, 300)

  return (
    <Container ref={containerRef} className={isShow ? "" : "hidden"}>SearchBox
      <input type="text" placeholder="搜索" ref={inputRef} onInput={handleInput} />
      <div>{res.map((r, i) => {
        return <div key={i}>{r.ref}</div>
      })}</div>
    </Container>
  )
}

const Container = styled.div`
  min-width: 160px;
  min-height: 30px;
  background-color: gray;
  position: fixed;
  z-index: 10;
  top: 63px;
  right: 0px;

  &.hidden {
    display: none;
  }
`

export default SearchBox
