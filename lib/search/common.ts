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
  excerpts?: {
    word: string,
    excerpt?: string,
  }[]
}

export abstract class Engine {
  abstract search(s: string | string[]): any
}

// Type reference tools
export type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};
