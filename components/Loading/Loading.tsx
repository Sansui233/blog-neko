import { useEffect, useRef, useState } from "react"
import style from "./Loading.module.css"


export default function Loading() {
  const [out, setout] = useState(false)
  const myRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOnload = () => {
      setout(true)
      setTimeout(() => {
        if (myRef.current) {
          myRef.current.style.display = "none"
        }
      }, 1100);
    }
    handleOnload()
  }, [])

  return (
    <div className={out ? style.layoutHide : style.layout} ref={myRef}>
      {/* <span className={style.loading}>Loading</span> */}
    </div>
  )
}