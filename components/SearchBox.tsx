import lunr from "lunr"; // TODO 要自己改库，Lunr不支持中文搜索
import { FormEvent, useEffect, useRef, useState } from 'react';
import styled from "styled-components";
import { SearchObj } from '../lib/search';

const SEARCHDOC = '/data/posts/index.json'

type Props = {
  ourSetSearch: (isShow: boolean) => void
  stateToInner: boolean
  iconEle: React.RefObject<HTMLDivElement> // 这个组件有从内部控制外部，但外部的搜索图标是随便放的，所以需要传入
}


function SearchBox({ ourSetSearch: outShow, stateToInner: outstate, iconEle }: Props) {
  const [idx, setidx] = useState(lunr(function () { }))
  const [res, setres] = useState<lunr.Index.Result[]>([])
  const [isShow, setIsShow] = useState(outstate)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef(null)

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

        const newIdx = lunr(function () {
          this.ref('id');
          this.field('content');

          (data as SearchObj[]).forEach(doc => {
            this.add(doc)
          }, this);
        })

        setidx(newIdx)
      })
  }, [])

  // Click Outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const clickSearchBox = containerRef.current && containerRef.current.contains((e.target as Node))
      const clickSearchIcon = iconEle.current && iconEle.current?.contains((e.target as Node))
      console.log("%%%%%%%%%%%% click inside", clickSearchBox, clickSearchIcon)
      if (!clickSearchBox && !clickSearchIcon) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Node inherit from EventTarget
        toggle(false)
      }
    }

    document.addEventListener('mousedown', (e) => handleClick(e), false);

    return () => {
      document.removeEventListener('mousedown', (e) => handleClick(e), false);
    }
  }, [])


  const search = function (str: string) {
    const res = idx.search(str)
    return res
  }

  const handleInput = function (e: FormEvent<HTMLInputElement>) {
    setres(search(e.currentTarget.value))
  }

  return (
    <Container ref={containerRef} className={isShow ? "" : "hidden"}>SearchBox
      <input type="text" placeholder="搜索" ref={inputRef} onInput={handleInput} />
      <div>{res.map(r => {
        return <div>{r.ref}</div>
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
