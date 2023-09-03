import { throttle } from "../throttle"
import { Engine, Result, SearchObj } from "./common"

type Config = {
  data: SearchObj[]
  ref: string,
  field: Array<keyof SearchObj>
  notifier: (res: Result[]) => void // 通常是 useState 的 set 函数
}

export class Naive<R extends Result> extends Engine {
  declare data: SearchObj[]
  declare ref: string
  declare field: Array<keyof SearchObj>

  declare tasks: Array<Promise<void>>
  declare res: Result[] // TODO Customize result Interface
  declare notify: (res: Result[]) => void // throttled Notify
  declare notifyInstant: (res: Result[], isDone: boolean) => void // 向外传递结果和状态

  constructor(conf: Config) {
    super()
    this.data = conf.data
    this.ref = conf.ref
    this.field = conf.field

    this.tasks = []
    this.res = []
    this.notify = throttle(conf.notifier, 125) // Update 中间结果时用取值参考的，流畅度参考动画3拍1
    this.notifyInstant = conf.notifier // Update 最后的结果
  }

  async search(s: string) {
    s = s.replace(/^\s+|\s+$/g, "") // remove blank at start and end

    if (s === "") {
      this.notifyInstant([], true)
      return
    }

    this._tasks_add(s)

    await Promise.all(this.tasks)

    this.notifyInstant([...this.res], true)
    this._clear()
    return
  }

  _tasks_add(s: string) {
    this.data.forEach((o) => {
      this.tasks.push(this.find(s, o))
    })
  }

  _clear() {
    this.tasks = []
    this.res = []
  }

  find(s: string, o: SearchObj, i?: number) {

    return new Promise<void>(resolve => {
      for (let j = 0; j < this.field.length; j++) {

        const f = this.field[j]
        if (!(f in o)) {
          continue
        }

        // search
        const index = this._match(o[f], s)

        if (index !== -1) {
          // generate excerpt
          const excerpt = (() => {
            if (f !== "title") {
              const start = (index - 10) < 0 ? 0 : index - 10
              const end = (index + 40) > o[f].length ? o[f].length : index + 40
              console.log(start, end, o[f].length)
              return o[f].slice(start, end).replaceAll("\n","")
            }
          })()

          console.log(excerpt)

          this.res.push({
            ref: o.id,
            title: o.title,
            excerpt: excerpt ? excerpt : undefined,
            matched: s,
          })
          break;
        }
      }

      // Notify observer
      if (this.res.length !== 0) {
        this.notify([...this.res])
      }
      resolve();
    });
  }

  /**
   * Find index in 
   * Optimze for Word split
   * @param s source
   * @param p pattern
   * @returns index. -1 for not found
   */
  _match(s: string, p: string) {

    s = s.toLowerCase();
    p = p.toLowerCase();

    // 带中文直接返回，分词在浏览器没法
    if (!/^[A-Za-z]+$/.test(p)) {
      return s.indexOf(p);
    } else {
      // English
      const pattern = new RegExp(`\\b${p}\\b`, 'i');
      const match = pattern.exec(s);
      if (match) {
        return match.index;
      }
    }

    return -1;
  }


}
