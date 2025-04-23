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
  test('Is Uniform', () => {
    expect(
      new BasisSpline([
        [0, 0], // these don't matter
        [1, 1],
        [2, 1],
        [3, 0],
      ], 2, [0, 0, 0, 1, 2, 2, 2]).isUniform()
    ).toBe(
      true
    )

    expect(
      new BasisSpline([
        [0, 0], // these don't matter
        [1, 1],
        [2, 1],
        [3, 0],
      ], 2, [0, 0, 0, 0.5, 2, 2, 2]).isUniform()
    ).toBe(
      false
    )
  });
  test('Is Open', () => {
    expect(
      new BasisSpline([
        [0, 0], // these don't matter
        [1, 1],
        [2, 1],
        [3, 0],
      ], 2, [0, 0, 0, 1, 2, 2, 2]).isOpen()
    ).toBe(
      true
    )

    expect(
      new BasisSpline([
        [0, 0], // these don't matter
        [1, 1],
        [2, 1],
        [3, 0],
      ], 2, [0, 0, 1, 1, 2, 2, 2]).isOpen()
    ).toBe(
      false
    )
  });
});
