import { BasisSpline } from "@/lib/BasisSpline";
import { useEffect, useState } from "react";

export default function hook(points: [number, number][], degree: number, knots: number[])
{
  const [spline, setSpline] = useState<BasisSpline>();

  useEffect(() => {
    // TODO propogate error if spline is invalid
    setSpline(new BasisSpline(points, degree, knots));
  }, [points, degree, knots])

  return [spline];
}

