import { BasisSpline } from "@/lib/BasisSpline";
import { useEffect, useState } from "react";

export default function hook(control: [number, number][], degree: number, knots: number[])
{
  const [spline, setSpline] = useState<BasisSpline>();

  useEffect(() => {
    // TODO propogate error if spline is invalid
    setSpline(new BasisSpline(control, degree, knots));
  }, [control, degree, knots])

  return [spline];
}

