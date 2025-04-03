import { Interval } from "@/interval";
import { Bound, BoundType } from "./bound";

class DateIntervalParseError extends Error {
    constructor(message: string = "Failed to parse date interval") {
        super(message);
        this.name = "DateIntervalParseError";
    }
}

function parseLocalDate(str: string): Date {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(str)) {
    throw new DateIntervalParseError("Invalid date format. Expected YYYY-mm-dd.");
  }

  const [year, month, day] = str.split("-").map(Number);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new DateIntervalParseError("Invalid month or day values.");
  }

  const date = new Date(year, month - 1, day);

  if (isNaN(date.getTime())) {
    throw new DateIntervalParseError("Invalid date.");
  }

  return date;
}

export class DateInterval implements Interval<Date> {
  lower: Bound<Date>;
  upper: Bound<Date>;

  constructor(lower?: Bound<Date>, upper?: Bound<Date>) {
    this.lower = lower ?? { type: BoundType.Unbounded };
    this.upper = upper ?? { type: BoundType.Unbounded };
  }

  /** Parse from ISO-like string */
  public static fromISOString(s: string): DateInterval {
    const [lowerStr, upperStr] = s.split("/");

    let ret = new DateInterval;

    // ISO-like strings are always inclusive, unless ".." is used

    if (lowerStr === "..") {
      ret.lower = { type: BoundType.Unbounded };
    } else {
      ret.lower = { type: BoundType.Included, value: parseLocalDate(lowerStr) };
    }

    if (upperStr === "..") {
      ret.upper = { type: BoundType.Unbounded };
    } else {
      ret.upper = { type: BoundType.Included, value: parseLocalDate(upperStr) };
    }

    return ret;
  }

  /** To ISO-like string */
  public toISOString(): string {
    let lowerStr: string;
    let upperStr: string;

    if (this.lower.type === BoundType.Included) {
      lowerStr = this.lower.value.toISOString().split("T")[0];
    } else if (this.lower.type === BoundType.Excluded) {
      const excludedLower = new Date(this.lower.value);
      excludedLower.setDate(excludedLower.getDate() + 1);
      lowerStr = excludedLower.toISOString().split("T")[0];
    } else {
      lowerStr = "..";
    }

    if (this.upper.type === BoundType.Included) {
      upperStr = this.upper.value.toISOString().split("T")[0];
    } else if (this.upper.type === BoundType.Excluded) {
      const excludedUpper = new Date(this.upper.value);
      excludedUpper.setDate(excludedUpper.getDate() - 1);
      upperStr = excludedUpper.toISOString().split("T")[0];
    } else {
      upperStr = "..";
    }

    return `${lowerStr}/${upperStr}`;
  }
}
