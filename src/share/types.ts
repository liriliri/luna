// https://stackoverflow.com/questions/57835286/deep-recursive-requiredt-on-specific-properties
export type DeepRequired<T, P extends string[]> = T extends object
  ? Omit<T, Extract<keyof T, P[0]>> &
      Required<{
        [K in Extract<keyof T, P[0]>]: NonNullable<
          DeepRequired<T[K], ShiftUnion<P>>
        >
      }>
  : T

type Shift<T extends any[]> = ((...t: T) => any) extends (
  first: any,
  ...rest: infer Rest
) => any
  ? Rest
  : never

type ShiftUnion<T> = T extends any[] ? Shift<T> : never
