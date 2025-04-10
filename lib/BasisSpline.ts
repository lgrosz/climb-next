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

    // Defensive copies to ensure immutability
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

  withAddedControlPoint(x: number, y: number): BasisSpline {
    const newControl: [number, number][] = [...this.control, [x, y]];
    return new BasisSpline(newControl, this.degree);
  }

  withRemovedControlPoint(index: number): BasisSpline {
    if (index < 0 || index >= this.control.length) {
      throw new Error("Invalid control point index.");
    }
    const newControl = this.control.slice(0, index).concat(this.control.slice(index + 1));
    return new BasisSpline(newControl, this.degree);
  }

  withControlPoints(points: [number, number][]): BasisSpline {
    if (points.length !== this.control.length) {
      throw new Error("Cannot change the number of control points");
    }
    return new BasisSpline(points, this.degree);
  }

  withDegree(newDegree: number): BasisSpline {
    return new BasisSpline(this.control, newDegree);
  }

  withKnots(knots: number[]): BasisSpline {
    if (knots.length !== this.control.length + this.degree + 1) {
      throw new Error("Knot vector length must be control points + degree + 1.");
    }
    return new BasisSpline(this.control, this.degree, knots);
  }

  isPointOnSpline(target: [number, number], tolerance: number = 1e-6): boolean {
    const samples = this.sample();

    let closestDistance: number | null = null;

    for (const sample of samples) {
      const distance = Math.sqrt(Math.pow(sample[0] - target[0], 2) + Math.pow(sample[1] - target[1], 2));
      if (closestDistance === null || distance < closestDistance) {
        closestDistance = distance;
      }

      if (distance <= tolerance) {
        return true;
      }
    }

    return false;
  }
}

