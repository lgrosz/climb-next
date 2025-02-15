import { GRAPHQL_ENDPOINT } from '@/constants'
import Link from 'next/link'
import Coordinate from '@/lib/Coordinate'
import { query } from '@/graphql';
import { Formation } from '@/graphql/schema';

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

  let location: Coordinate | null = null;

  if (formation.location?.latitude !== undefined && formation.location?.longitude !== undefined) {
    location = new Coordinate(formation.location.latitude, formation.location.longitude);
  }

  return (
    <div>
      <div>
        <h1>
          {
            formation.name ??
            <i>Unnamed formation</i>
          }
        </h1>
        <Link href={`/formations/${formation.id}/rename`}>Rename</Link>
      </div>
      <div>
        <h3>
          {
            location ?
            <a href={`geo:${location.latitude},${location.longitude}`}>
              {location.toDMSString()}
            </a> :
            <i>No location</i>
          }
        </h3>
        <Link href={`/formations/${formation.id}/relocate`}>Relocate</Link>
      </div>
      <div>
        {
          formation.parent ?
          <h2><Link href={`${parentHref}`}>{formation.parent.name}</Link></h2> :
          null
        }
        <Link href={`/formations/${formation.id}/move`}>Move</Link>
      </div>
      <div>
        <h3>Description</h3>
        <p>
          {
            formation.description ??
            <i>No description available</i>
          }
        </p>
        <Link href={`/formations/${formation.id}/describe`}>Describe</Link>
      </div>
      <div>
        <h3>Formations</h3>
        <Link href="/formations/new">New formation</Link>
      </div>
      <ul>
        {formation.formations?.map((formation) => (
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
        {formation.climbs?.map((climb) => (
          <li key={`climb-${climb.id}`}>
            <Link href={`/climbs/${climb.id}`}>{climb.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

