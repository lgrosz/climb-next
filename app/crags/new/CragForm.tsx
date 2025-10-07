"use client"

import { useSearchParams } from "next/navigation";
import { CragParentOptions } from "./CragParentOptions";

export default function CragForm({
  id,
  action,
  parentOptions,
}: {
  id?: string,
  action: (_: FormData) => Promise<void>
  parentOptions: CragParentOptions,
}) {
  const searchParams = useSearchParams();
  const defaultRegion = searchParams.get("region") || undefined;

  return (
    <form id={id} action={action}>
      <div>
	<label
	  className="block"
	  htmlFor="name"
	>
	  Add a name
	</label>
	<input
	  id="name"
	  type="text"
	  className="w-full"
	  name="name"
	/>
	<label
	  className="block"
	  htmlFor="description"
	>
	  Add a description
	</label>
	<textarea
	  id="description"
	  className="w-full resize-y"
	  name="description"
	/>
	<label
	  className="block"
	  htmlFor="region"
	>
	  Select a region
	</label>
	<select name="region" defaultValue={defaultRegion}>
	  <option label="No region" value={undefined} />
	  {parentOptions.regions.map(r => (
	    <option key={r.id} label={r.name ?? ""} value={r.id} />
	  ))}
	</select>
      </div>
    </form>
  );
}

