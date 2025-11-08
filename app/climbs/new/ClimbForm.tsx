"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ClimbParentOptions, CragClimbParentOption } from "./ClimbParentOptions";

function findSectorWithFormationInCrags(
  crags: Array<CragClimbParentOption>,
  formationId: string
) {
  for (const c of crags) {
    const sector = c.sectors
      .find(s => s.formations.some(f => f.id === formationId));
    if (sector) return sector.id;
  }
}

function findCragWithFormationInCrags(
  crags: Array<CragClimbParentOption>,
  formationId: string
) {
  const crag = crags
    .find(c => c.formations.some(f => f.id === formationId))

  return crag?.id;
}

function findCragWithSectorInCrags(
  crags: Array<CragClimbParentOption>,
  sectorId: string
) {
  const crag = crags
    .find(c => c.sectors.some(s => s.id === sectorId))

  return crag?.id;
}

export default function ClimbForm(
  {
    id,
    action,
    parentOptions,
  } : {
    id?: string
    action: (_: FormData) => Promise<void>
    parentOptions: ClimbParentOptions,
  }
) {
  const searchParams = useSearchParams();
  const defaultFormation = searchParams.get("formation") || undefined;

  const defaultSector = defaultFormation
    ? (() => {
        const sector = findSectorWithFormationInCrags(parentOptions.crags, defaultFormation)
        if (sector) return sector;

        for (const r of parentOptions.regions) {
          const sector = findSectorWithFormationInCrags(r.crags, defaultFormation);
          if (sector) return sector;
        }

        return undefined
      })()
    : searchParams.get("sector") || undefined;

  const defaultCrag =
    defaultSector
      ? (() => {
          const crag = findCragWithSectorInCrags(parentOptions.crags, defaultSector);
          if (crag) return crag;

          for (const r of parentOptions.regions) {
            const crag = findCragWithSectorInCrags(r.crags, defaultSector);
            if (crag) return crag;
          }

          return undefined;
        })()
    : defaultFormation
      ? (() => {
          const crag = findCragWithFormationInCrags(parentOptions.crags, defaultFormation);
          if (crag) return crag;

          for (const r of parentOptions.regions) {
            const crag = findCragWithFormationInCrags(r.crags, defaultFormation);
            if (crag) return crag;
          }

          return undefined;
        })()
    : searchParams.get("crag") || undefined;

  const defaultRegion =
    defaultCrag
      ? parentOptions.regions
          .find(r => r.crags.some(c => c.id === defaultCrag))?.id
    : defaultFormation
      ? parentOptions.regions
          .find(r => r.formations.some(f => f.id === defaultFormation))?.id
    : searchParams.get("region") || undefined;

  const regions = parentOptions.regions;

  const [region, setRegion] = useState<string | undefined>(defaultRegion);
  const crags = region !== undefined
    ? regions.find(r => r.id === region)?.crags ?? []
    : parentOptions.crags;

  const [crag, setCrag] = useState<string | undefined>(defaultCrag);
  const sectors = crag !== undefined
    ? crags.find(c => c.id === crag)?.sectors ?? []
    : [];

  const [sector, setSector] = useState<string | undefined>(defaultSector);
  const formations =
    sector !== undefined
      ? sectors.find(s => s.id === sector)?.formations ?? []
    : crag !== undefined
      ? crags.find(c => c.id === crag)?.formations ?? []
    : region !== undefined
      ? regions.find(r => r.id === region)?.formations ?? []
    : parentOptions.formations;

  return (
    <form id={id} action={action}>
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
        <legend>Select a parent</legend>
        <div>
          <label htmlFor="region">
            Region
          </label>
          <select
            defaultValue={defaultRegion}
            name="region"
            onChange={e => {
              setRegion(e.target.value)
              setCrag(undefined)
            }}
          >
            <option value={undefined} label="No region" />
            {regions.map(r => (
              <option key={r.id} value={r.id} label={r.name || "Anonymous region"} />
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="crag">
            Crag
          </label>
          <select
            defaultValue={defaultCrag}
            name="crag"
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
            defaultValue={defaultSector}
            name="sector"
            onChange={e => setSector(e.target.value)}
          >
            <option value={undefined} label="No sector" />
            {sectors.map(s => (
              <option key={s.id} value={s.id} label={s.name || "Anonymous sector"} />
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="formation">
            Select a formation
          </label>
          <select
            defaultValue={defaultFormation}
            name="formation"
          >
            <option value={undefined} label="No formation" />
            {formations.map(f => (
              <option key={f.id} value={f.id} label={f.name || "Anonymous formation"} />
            ))}
          </select>
        </div>
      </fieldset>
    </form>
  )
}
