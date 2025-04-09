export function deBoor(
  t: number,
  degree: number,
  controlPoints: [number, number][],
  knots: number[]
): [number, number] {
  const n = controlPoints.length - 1;

  // Find the knot span index `k`
  let k = -1;
  for (let i = degree; i <= n; i++) {
    if (t >= knots[i] && t < knots[i + 1]) {
      k = i;
      break;
    }
  }
  if (t === knots[knots.length - 1]) {
    k = n;
  }
  if (k === -1) throw new Error(`t=${t} is out of bounds`);

  // Copy affected control points
  const d: [number, number][] = [];
  for (let j = 0; j <= degree; j++) {
    d[j] = [...controlPoints[k - degree + j]];
  }

  // De Boor iterations
  for (let r = 1; r <= degree; r++) {
    for (let j = degree; j >= r; j--) {
      const i = k - degree + j;
      const alpha =
        (t - knots[i]) / (knots[i + degree - r + 1] - knots[i]) || 0;

      d[j][0] = (1 - alpha) * d[j - 1][0] + alpha * d[j][0];
      d[j][1] = (1 - alpha) * d[j - 1][1] + alpha * d[j][1];
    }
  }

  return d[degree];
}

// TODO May need to make this immutable so I can better use it in React state hooks...
export class BasisSpline {
  private control: [number, number][];
  private knots: number[];
  private degree: number;

  constructor(control: [number, number][] = [[0, 0], [1, 1]], degree: number = 1) {
    if (degree < 1 || degree > control.length - 1) {
      throw new Error(`Degree must be between 1 and ${control.length - 1}.`);
    }

    this.control = control;
    this.degree = degree;

    this.knots = BasisSpline.openUniformKnots(this.control.length, this.degree);
  }

  static openUniformKnots(n: number, k: number): number[] {
    const count = n + k + 1;

    const inner = Array.from({ length: count - k * 2 }, (_, index) => index);
    const left = Array(k).fill(inner[0]);
    const right = Array(k).fill(inner[inner.length - 1]);

    return [
      ...left,
      ...inner,
      ...right,
    ];
  }

  sample(f = deBoor, n: number = 100): [number, number][] {
    const tMin = this.knots[this.degree];
    const tMax = this.knots[this.knots.length - this.degree - 1];

    const samples: [number, number][] = [];

    for (let i = 0; i <= n; i++) {
      const t = tMin + (tMax - tMin) * (i / n);
      const pt = f(t, this.degree, this.control, this.knots);
      samples.push(pt);
    }

    return samples;
  }

  addControlPoint(x: number, y: number) {
    this.control.push([x, y]);

    if (this.degree > this.control.length - 1) {
      throw new Error(`Degree must be between 1 and ${this.control.length - 1}.`);
    }

    // TODO We should only do this if we force the spline to be open and uniform
    this.knots = BasisSpline.openUniformKnots(this.control.length, this.degree);
  }

  removeControlPoint(index: number) {
    if (index >= 0 && index < this.control.length) {
      this.control.splice(index, 1);

      if (this.degree > this.control.length - 1) {
        throw new Error(`Degree must be between 1 and ${this.control.length - 1}.`);
      }

      // TODO We should only do this if we force the spline to be open and uniform
      this.knots = BasisSpline.openUniformKnots(this.control.length, this.degree);
    } else {
      throw new Error("Invalid control point index.");
    }
  }

  setControlPoints(points: [number, number][]) {
    if (points.length != this.control.length) {
      throw new Error("Cannot change the number of control points");
    }

    this.control = points;

    // TODO We should only do this if we force the spline to be open and uniform
    this.knots = BasisSpline.openUniformKnots(this.control.length, this.degree);
  }

  setDegree(newDegree: number) {
    if (newDegree < 1 || newDegree > this.control.length - 1) {
      throw new Error(`Degree must be between 1 and ${this.control.length - 1}.`);
    }

    this.degree = newDegree;

    // TODO We should only do this if we force the spline to be open and uniform
    this.knots = BasisSpline.openUniformKnots(this.control.length, this.degree);
  }

  setKnots(knots: number[]) {
    if (knots.length !== this.control.length + this.degree + 1) {
      throw new Error("Knot vector length must be control points + degree + 1.");
    }

    this.knots = knots;
  }

  getControlPoints(): [number, number][] {
    return this.control;
  }

  getDegree(): number {
    return this.degree;
  }

  getOrder(): number {
    return this.degree + 1;
  }

  getKnots(): number[] {
    return this.knots;
  }
}

