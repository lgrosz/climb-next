import { GRAPHQL_ENDPOINT } from '@/constants'
import Link from 'next/link'
import { query } from '@/graphql'

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

interface Formation {
  id: number,
  name: string | null,
  parent: FormationParent | null,
  formations: SubFormation[],
  climbs: Climb[],
}

const dataQuery = `
  query($id: Int!) {
    formation(
      id: $id
    ) {
      id name
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

export default async function Page({ params }: { params: { id: string } }) {
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
    parentHref = `/area/${formation.parent.id}`
  } else if (formation?.parent?.__typename == "Formation") {
    parentHref = `/formation/${formation.parent.id}`
  }

  return (
    <div>
      {
        formation.name ?
        <h1>{formation.name}</h1> :
        <h1><i>Unnamed formation</i></h1>
      }
      {
        formation.parent ?
        <h2><Link href={`${parentHref}`}>{formation.parent.name}</Link></h2> :
        null
      }
      <h3>Formations</h3>
      <ul>
        {formation.formations.map((formation) => (
          <li key={`formations-${formation.id}`}>
            <Link href={`/formation/${formation.id}`}>{formation.name}</Link>
          </li>
        ))}
      </ul>
      <h3>Climbs</h3>
      <ul>
        {formation.climbs.map((climb) => (
          <li key={`climb-${climb.id}`}>
            <Link href={`/climb/${climb.id}`}>{climb.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

