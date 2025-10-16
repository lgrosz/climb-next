"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormationParentOptions } from "./FormationParentOptions";

export default function FormationForm(
  {
    id,
    action,
    parentOptions,
  } : {
    id?: string,
    action: (_: FormData) => Promise<void>,
    parentOptions: FormationParentOptions,
  }
) {
  const searchParams = useSearchParams();

  const defaultSector = searchParams.get("sector") || undefined;

  // TODO This logic is a bit messy and could be better. Really, in both of these cases, we know
  // what the default-region is, so we don't need to calculate that afterward.
  const defaultCrag = defaultSector
    ? (() => {
        // check root crags first
        const crag = parentOptions.crags
          .find(c => c.sectors.some(s => s.id === defaultSector));
        if (crag) return crag.id;

        // check crags nested under regions
        for (const r of parentOptions.regions) {
          // TODO technically, here we also know the default-region
          const crag = r.crags
            .find(c => c.sectors.some(s => s.id === defaultSector));
          if (crag) return crag.id;
        }

        return undefined;
      })()
    : searchParams.get("crag") || undefined;

  const defaultRegion = defaultCrag
    ? parentOptions.regions
        .find(c => c.crags.some(s => s.id === defaultCrag))?.id
    : searchParams.get("region") || undefined;

  const [region, setRegion] = useState<string | undefined>(defaultRegion);
  const crags = region !== undefined
    ? parentOptions.regions.find(r => r.id === region)?.crags ?? []
    : parentOptions.crags;

  const [crag, setCrag] = useState<string | undefined>(defaultCrag);
  const sectors = crag !== undefined
    ? crags.find(c => c.id === crag)?.sectors ??[]
    : [];

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
        <fieldset>
          <legend>Coordinates</legend>
          <label className="block">
            Latitude
            <input
              className="block"
              type="number"
              name="latitude"
              step="any"
            />
          </label>
          <label className="block">
            Longitude
            <input
              className="block"
              type="number"
              name="longitude"
              step="any"
            />
          </label>
        </fieldset>
        <fieldset>
          <legend>Select a parent</legend>
          <div>
            <label htmlFor="region">
              Region
            </label>
            <select
              name="region"
              defaultValue={defaultRegion}
              onChange={e => {
                setRegion(e.target.value)
                setCrag(undefined)
              }}
            >
              <option value={undefined} label="No region" />
              {parentOptions.regions.map(r => (
                <option key={r.id} value={r.id} label={r.name || "Anonymous region"} />
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="crag">
              Crag
            </label>
            <select
              name="crag"
              defaultValue={defaultCrag}
              onChange={e => setCrag(e.target.value)}
            >
              <option value={undefined} label="No crag" />
              {crags.map(c => (
                <option key={c.id} value={c.id} label={c.name || "Anonymous crag"} />
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sector">
              Select a sector
            </label>
            <select
              name="sector"
              defaultValue={defaultSector}
            >
              <option value={undefined} label="No sector" />
              {sectors.map(s => (
                <option key={s.id} value={s.id} label={s.name || "Anonymous sector"} />
              ))}
            </select>
          </div>
        </fieldset>
      </div>
    </form>
  );
}
