"use client";

import { parseLocalDate } from "@/lib/DateUtils";
import { DetailedHTMLProps, FormHTMLAttributes, useState } from "react";

function formatDate(d: Date) {
  const offset = d.getTimezoneOffset();
  d = new Date(d.getTime() - (offset * 60 * 1000));
  return d.toISOString().split("T")[0];
}

type Climber = {
  id: string,
  firstName: string,
  lastName: string,
};

export default function AscentForm({
  climbers,
  ...props
}: {
  climbers?: Array<Climber>,
} & DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>) {
  const [minDate, setMinDate] = useState<Date>()
  const [maxDate, setMaxDate] = useState<Date>()

  return (
    <form {...props}>
      {climbers &&
	<div>
	  <label htmlFor="party">Party:</label>
	  <select id="party" name="party" multiple>
	    <option
	      value={undefined}
	      label="None"
	    />
	    {climbers.map(c => (
	      <option key={c.id} value={c.id}>
		{c.firstName} {c.lastName}
	      </option>
	    ))}
	  </select>
	</div>
      }
      <div>
	<label htmlFor="party-complete">Party complete:</label>
	<input id="party-complete" name="party-complete" type="checkbox" />
      </div>
      <div>
	<label>Date window</label>
	<input
	  id="date-low"
	  name="date-low"
	  type="date"
	  max={(maxDate && formatDate(maxDate)) || formatDate(new Date)}
	  onChange={e => setMinDate(parseLocalDate(e.target.value))}
	/>
	<input
	  id="date-high"
	  name="date-high"
	  type="date"
	  min={minDate && formatDate(minDate)}
	  max={formatDate(new Date)}
	  onChange={e => setMaxDate(parseLocalDate(e.target.value))}
	/>
      </div>
      <div>
	<label htmlFor="fa">First ascent:</label>
	<input id="fa" name="fa" type="checkbox" />
      </div>
      <div>
	<label htmlFor="verified">Verified:</label>
	<input id="verified" name="verified" type="checkbox" />
      </div>
    </form>
  );
}
