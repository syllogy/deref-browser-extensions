// EmptyObject allows objects that explicitly do not have any "own" properties.
// It's most useful for when you want to represent a literal empty object `{}`.
// NOTE: The type literal `{}` means something totally different and unrelated.
export type EmptyObject = Record<keyof any, never>;

// EmptyInterface allows any type on which you can have properties (ie excludes
// null and undefined), but does not imply an indexing interface (like Dict),
// nor does it prevent unexpected extra properties (like EmptyObject).
// NOTE: The empty type literal `{}` is not a synonym for this, it's actually
// closer to `object` and `any`.
export interface EmptyInterface {}

export type Dict<T = unknown> = { [key: string]: T };

export const isDict = (x: any): x is Dict<unknown> =>
  isObject(x) && x.constructor === Object;

export const isObject = (x: any): x is Record<keyof any, unknown> =>
  x !== null && typeof x === 'object' && !Array.isArray(x);

export const isUndefined = (x: unknown): x is undefined =>
  typeof x === 'undefined';

export const isDefined = <T>(x: T | undefined): x is T => x !== undefined;

export const isTrue = (x: unknown): x is true => x === true;

export const isFalse = (x: unknown): x is false => x === false;

export const isString = (x: unknown): x is string => typeof x === 'string';

export const isNumber = (x: unknown): x is number => typeof x === 'number';

export const isBoolean = (x: unknown): x is boolean => typeof x === 'boolean';

export type AsyncReturnType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => Promise<infer U>
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : never;
