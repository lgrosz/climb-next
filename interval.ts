import { Bound } from "@/bound";

export type Interval<T> = {
  lower: Bound<T>,
  upper: Bound<T>,
};
