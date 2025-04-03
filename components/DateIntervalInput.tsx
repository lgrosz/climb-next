'use client';

import { useState } from "react";

// TODO It'd be great if this was a form-associated input element, so I could
// use it just like a semantic HTML <input/>

export default function DateIntervalInput(
  {
    id,
    name,
    max,
  }: {
    id: string,
    name: string,
    max: string,
  }
) {
  const [lower, setLower] = useState<string>()
  const [upper, setUpper] = useState<string>()

  return (
    <span id={id}>
      <input type="date"
	max={upper}
	onChange={e => setLower(e.target.value)}
      />
      /
      <input type="date"
	min={lower}
	max={max}
	onChange={e => setUpper(e.target.value)}
      />
      <input /* This is the input that the form would get */
	name={name}
	type="hidden"
	value={`${lower ? lower : ".."}/${upper ? upper : ".."}`}
      />
    </span>
  );
}

