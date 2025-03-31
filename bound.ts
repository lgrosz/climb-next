export enum BoundType {
  Included,
  Excluded,
  Unbounded,
}

export type Bound<T> =
  | { type: BoundType.Included, value: T }
  | { type: BoundType.Excluded, value: T }
  | { type: BoundType.Unbounded }

// TODO
// - lower <= upper
// - normalize to [) for discrete types
