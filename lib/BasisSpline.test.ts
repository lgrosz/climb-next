import { describe, expect, test } from "@jest/globals";

import { BasisSpline } from "./BasisSpline";

describe("Basis Splines", () => {
  test('Open, Uniform Knots', () => {
    expect(
      BasisSpline.openUniformKnots(2, 1)
    ).toStrictEqual(
      [0, 0, 1, 1]
    )

    expect(
      BasisSpline.openUniformKnots(3, 1)
    ).toStrictEqual(
      [0, 0, 1, 2, 2]
    )

    expect(
      BasisSpline.openUniformKnots(3, 2)
    ).toStrictEqual(
      [0, 0, 0, 1, 1, 1]
    )

    expect(
      BasisSpline.openUniformKnots(4, 2)
    ).toStrictEqual(
      [0, 0, 0, 1, 2, 2, 2]
    )
  });
});
