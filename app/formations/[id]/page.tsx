import { GRAPHQL_ENDPOINT } from '@/constants'
import Link from 'next/link'
import { query } from '@/graphql'
import {
  relocate as relocateFormation,
} from '@/formations/actions'

interface FormationParent {
  __typename: string,
  id: number,
  name: string | null
}

interface SubFormation {
  id: number,
  name: string | null
}

interface Climb {
  id: number,
  name: string | null
}

interface Coordinate {
  latitude: number,
  longitude: number,
}

interface Formation {
  id: number,
  name: string | null,
  description: string | null,
  location: Coordinate | null,
  parent: FormationParent | null,
  formations: SubFormation[],
  climbs: Climb[],
}

const dataQuery = `
  query($id: Int!) {
    formation(
      id: $id
    ) {
      id name description
      location { latitude longitude }
      formations { id name }
      climbs { id name }
      parent {
        __typename
        ... on Area { id name }
        ... on Formation { id name }
      }
    }
  }
`

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const result = await query(GRAPHQL_ENDPOINT, dataQuery, { id: parseInt(params.id) })
    .then(r => r.json());
  const { data, errors } = result;

  if (errors) {
    console.error(JSON.stringify(errors, null, 2));
    return <div>There was an error generating the page.</div>
  }

  const { formation }: { formation: Formation } = data;

  let parentHref: string | null = null;
  if (formation?.parent?.__typename == "Area") {
    parentHref = `/areas/${formation.parent.id}`
  } else if (formation?.parent?.__typename == "Formation") {
    parentHref = `/formations/${formation.parent.id}`
  }

  const round = (num: number, precision: number) => {
    var base = 10 ** precision;
    return Math.round(num * base) / base;
  }

  const dms = (d: number, isLatitude: boolean) => {
    const degrees = Math.floor(d);
    const minutesAndSeconds = (d - degrees) * 60;
    const minutes = Math.floor(minutesAndSeconds);
    const seconds = (minutesAndSeconds - minutes) * 60;
    const direction = isLatitude ? (d >= 0 ? 'N' : 'S') : (d >= 0 ? 'E' : 'W');
    return `${degrees}°${minutes.toString().padStart(2, '0')}'${round(seconds, 1).toFixed(1).toString().padStart(4, '0')}"${direction}`;
  }

  return (
    <div>
      <h1>
        {
          formation.name ??
          <i>Unnamed formation</i>
        }
      </h1>
      <Link href={`/formations/${formation.id}/rename`}>Rename</Link>
      <h3>
        {
          formation.location ?
          <a href={`geo:${formation.location.latitude},${formation.location.longitude}`}>
            ({dms(formation.location.latitude, true)} {dms(formation.location.longitude, false)})
          </a> :
          <i>No location</i>
        }
      </h3>
      <Link href={`/formations/${formation.id}/relocate`}>Relocate</Link>
      {
        formation.parent ?
        <h2><Link href={`${parentHref}`}>{formation.parent.name}</Link></h2> :
        null
      }
      <div>
        <h3>Description</h3>
        <p>
          {
            formation.description ??
            <i>No description available</i>
          }
        </p>
      </div>
      <div>
        <h3>Formations</h3>
        <Link href="/formations/new">New formation</Link>
      </div>
      <ul>
        {formation.formations.map((formation) => (
          <li key={`formations-${formation.id}`}>
            <Link href={`/formations/${formation.id}`}>{formation.name}</Link>
          </li>
        ))}
      </ul>
      <div>
        <h3>Climbs</h3>
        <Link href="/climbs/new">New climb</Link>
      </div>
      <ul>
        {formation.climbs.map((climb) => (
          <li key={`climb-${climb.id}`}>
            <Link href={`/climbs/${climb.id}`}>{climb.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

