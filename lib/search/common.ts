export type SearchObj = {
  id: string,
  title: string,
  content: string,
  description: string,
  keywords: string,
  date: string
}

export interface Result {
  ref: string
  title: string
  excerpt?: string
  matched: string
}

export abstract class Engine {
  abstract search(s: string): any
}

