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

  bounds(): [[number, number], [number, number]] {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const [x, y] of this.sample()) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    return [[minX, minY], [maxX, maxY]];
  }

  isOpen() {
    const left = this.knots[0];
    const right = this.knots[this.knots.length - 1];
    const order = this.degree + 1;

    return (
      this.knots.slice(0, order).every(k => k === left) &&
      this.knots.slice(-order).every(k => k === right)
    );
  }

  isUniform() {
    const innerStart = this.degree;
    const innerEnd = this.knots.length - this.degree - 1;

    if (innerEnd <= innerStart) return true; // Too short to tell

    const delta = this.knots[innerStart + 1] - this.knots[innerStart];

    for (let i = innerStart + 1; i <= innerEnd; i++) {
      if (this.knots[i] - this.knots[i - 1] !== delta) {
        return false;
      }
    }

    return true;
  }
}
