export type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;
// Type reference tools

export type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property]
}

export type If<C extends boolean, T, F> =  C extends true ? T : F;

export type Extend<T extends object> = {
  [K in keyof T]: T[K]
} & {
  [name: string]: any
}