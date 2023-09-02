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

  // Core function
  find(s: string, o: SearchObj, i?: number) {

    return new Promise<void>(resolve => {
      const include = this.field.some(f => {
        if (f in o) { // ?都在 if 里了这还不能自己推断类型吗，TS好麻烦
          if (o[f as keyof SearchObj].includes(s)) {
            return true
          }
        }
        return false
      })

      if (include) {
        this.res.push({
          ref: o.title
        })
      }

      this.notify([...this.res])
      resolve();
    });
  }
}
