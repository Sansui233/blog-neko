export type SearchObj = {
  id: string,
  title: string,
  content: string,
  tags?: string[],
  description?: string,
  keywords?: string,
  date?: string
}

export interface Result {
  ref: string
  title: string
  matches?: {
    word: string,
    excerpt?: string,
  }[]
}

export abstract class Engine {
  abstract search(s: string | string[]): unknown
}

// Type reference tools
export type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};
