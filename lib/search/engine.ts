import { throttle } from "../throttle";
import { Engine, Result, SearchObj, WithRequiredProperty } from "./common";
import stopwords from "./stopwords/zh.json";

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
  declare res: Array<WithRequiredProperty<Result, "excerpts">>
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

  async search(strs: string[]) {
    strs = strs.map(s => s.replace(/^\s+|\s+$/g, "")).filter(v => v !== "")// remove blank at start and end

    if (strs.length === 0) {
      this.notifyInstant([], true)
      return
    }

    this._tasks_add(strs)
    await Promise.all(this.tasks)

    // Sort Object
    this.res = this.res.sort((a, b) => {
      return a.excerpts?.length >= b.excerpts?.length? -1 : 1
    })

    this.notifyInstant([...this.res], true)
    this._clear()
    return
  }

  _tasks_add(s: string[]) {
    this.data.forEach((o) => {
      this.tasks.push(this.find(s, o))
    })
  }

  _clear() {
    this.tasks = []
    this.res = []
  }

  /**
   * Find if all strings in an array are in a search Object
   * 以 SearchObj为粒度的搜索
   * 目前的实现非跨field搜索， 关键词之间为 And 逻辑
   */
  find(strs: string[], o: SearchObj, i?: number) {

    return new Promise<void>(resolve => {
      for (let j = 0; j < this.field.length; j++) {

        const f = this.field[j]
        if (!(f in o)) {
          continue
        }

        // search in lower case mode
        const indexs = this._match(o[f].toLowerCase(), strs.map(s => s.toLocaleLowerCase()))

        // build result
        if (indexs.length !== 0) {
          const excerpts = indexs.map(i => {

            const start = (i.index - 10) < 0 ? 0 : i.index - 10
            const end = (i.index + 40) > o[f].length ? o[f].length : i.index + 40
            // console.log(start, end, o[f].length)
            return {
              word: i.word,
              excerpt: f !== "title" ? o[f].slice(start, end).replaceAll("\n", "") : undefined
            }
          })

          this.res.push({
            ref: o.id,
            title: o.title,
            excerpts: excerpts
          })


          break; // 在任何一个域中找全就停止field search
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
   * get index in
   * matches is both
   */
  _match(s: string, patterns: string[]): {
    word: string,
    index: number,
  }[] {

    const res: { word: string, index: number }[] = []

    for (const p of patterns) {
      if (stopwords.includes(p)) {
        break
      }

      if (!/^[A-Za-z]+$/.test(p)) {
        // 带中文直接返回，分词在浏览器没法
        const index = s.indexOf(p)
        if (index !== -1) {
          res.push({ word: p, index: index })
        } else { // once pattern match fails then return false
          break
        }
      } else {
        // English with word split
        const reg = new RegExp(`\\b${p}\\b`, 'i');
        const match = reg.exec(s);
        if (match) {
          res.push({ word: p, index: match.index })
        } else {
          break
        }
      }
    }

    return res;
  }

  _isStopword(s: string) {
    if (stopwords.includes(s)) { return true }
  }

}
