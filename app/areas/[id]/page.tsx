import { GRAPHQL_ENDPOINT } from '@/constants'
import Link from 'next/link'
import { query } from '@/graphql'

interface SubArea {
  id: number,
  name: string | null,
}

interface Formation {
  id: number,
  name: string | null,
}

interface Climb {
  id: number,
  name: string | null,
}

interface AreaParent {
  __typename: string,
  id: number,
  name: string | null,
}

interface Area {
  id: number,
  name: string | null,
  areas: SubArea[],
  formations: Formation[],
  climbs: Climb[],
  parent: AreaParent | null,
}

const dataQuery = `
  query($id: Int!) {
    area(
      id: $id
    ) {
      id name
      areas { id name }
      formations { id name }
      climbs { id name }
      parent {
        __typename
        ... on Area { id name }
      }
    }
  }
`

export default async function Page({ params }: { params: { id: string } }) {
  const result = await query(GRAPHQL_ENDPOINT, dataQuery, { id: parseInt(params.id) })
    .then(r => r.json());
  const { data, errors } = result;

  if (errors) {
    console.error(JSON.stringify(errors, null, 2));
    return <div>There was an error generating the page.</div>
  }

  const { area }: { area: Area } = data;

  let parentHref: string | null = null;
  if (area?.parent?.__typename == "Area") {
    parentHref = `/areas/${area.parent.id}`
  }

  return (
    <div>
      {
        area.name ?
        <h1>{area.name}</h1> :
        <h1><i>Unnamed Area</i></h1>
      }
      {
        area.parent ?
        <h2><Link href={`${parentHref}`}>{area.parent.name}</Link></h2> :
        null
      }
      <h3>Areas</h3>
      <ul>
        {area.areas.map((area) => (
          <li key={`area-${area.id}`}>
            <Link href={`/areas/${area.id}`}>{area.name}</Link>
          </li>
        ))}
      </ul>
      <h3>Formations</h3>
      <ul>
        {area.formations.map((formation) => (
          <li key={`formation-${formation.id}`}>
            <Link href={`/formations/${formation.id}`}>{formation.name}</Link>
          </li>
        ))}
      </ul>
      <h3>Climbs</h3>
      <ul>
        {area.climbs.map((climb) => (
          <li key={`climb-${climb.id}`}>
            <Link href={`/climbs/${climb.id}`}>{climb.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

