export class BasisSpline {
  readonly control: [number, number][];
  readonly knots: number[];
  readonly degree: number;

  constructor(
    control: [number, number][] = [[0, 0], [1, 1]],
      degree: number = 1,
      knots?: number[]
  ) {
    if (degree < 1 || degree > control.length - 1) {
      throw new Error(`Degree must be between 1 and ${control.length - 1}.`);
    }

    this.control = control.map(([x, y]) => [x, y]);
    this.degree = degree;
    this.knots = knots
      ? [...knots]
      : BasisSpline.openUniformKnots(control.length, degree);
  }

  static openUniformKnots(n: number, k: number): number[] {
    const count = n + k + 1;
    const inner = Array.from({ length: count - k * 2 }, (_, index) => index);
    const left = Array(k).fill(inner[0]);
    const right = Array(k).fill(inner[inner.length - 1]);
    return [...left, ...inner, ...right];
  }
}
