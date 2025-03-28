import { graphql } from '@/gql';
import { graphqlQuery } from '@/graphql';
import Link from 'next/link'

const areaData = graphql(`
  query areaData($id: ID!) {
    area(
      id: $id
    ) {
      id name description
      areas { id name }
      formations { id name }
      climbs { id name }
      parent {
        __typename
        ... on Area { id name }
      }
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await graphqlQuery(
    areaData,
    { id: params.id }
  );

  const { area } = data;

  let parentHref: string | null = null;
  if (area.parent?.__typename == "Area") {
    parentHref = `/areas/${area.parent.id}`
  }

  return (
    <div>
      <div>
        <h1>
          {
            area.name ??
            <i>Unnamed area</i>
          }
        </h1>
        <Link href={`/areas/${area.id}/rename`}>Rename</Link>
      </div>
      <div>
        {
          area.parent ?
          <h2><Link href={`${parentHref}`}>{area.parent.name}</Link></h2> :
          null
        }
        <Link href={`/areas/${area.id}/move`}>Move</Link>
      </div>
      <div>
        <h3>Description</h3>
        <p>
          {
            area.description ??
            <i>No description available</i>
          }
        </p>
        <Link href={`/areas/${area.id}/describe`}>Describe</Link>
      </div>
      <div>
        <h3>Areas</h3>
        <Link href="/areas/new">New area</Link>
      </div>
      <ul>
        {area.areas.map((area) => (
          <li key={`area-${area.id}`}>
            <Link href={`/areas/${area.id}`}>{area.name}</Link>
          </li>
        ))}
      </ul>
      <div>
        <h3>Formations</h3>
        <Link href="/formations/new">New formation</Link>
      </div>
      <ul>
        {area.formations.map((formation) => (
          <li key={`formation-${formation.id}`}>
            <Link href={`/formations/${formation.id}`}>{formation.name}</Link>
          </li>
        ))}
      </ul>
      <div>
        <h3>Climbs</h3>
        <Link href="/climbs/new">New climb</Link>
      </div>
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

