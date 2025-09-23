import { graphqlQuery } from '@/graphql';
import { graphql } from '@/gql';
import Link from 'next/link';

const regionData = graphql(`
  query regionData($id: ID!) {
    region(
      id: $id
    ) {
      name
      description
      crags { id name }
      formations { id name }
      climbs { id name }
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await graphqlQuery(
    regionData,
    { id: params.id }
  );

  const { region } = data;

  return (
    <div>
      <h1>
        {
          region.name ??
          <i>Unnamed region</i>
        }
      </h1>
      <h3>Description</h3>
      <p>
        {
          region.description ??
          <i>No description available</i>
        }
      </p>
      <h3>Sectors</h3>
      <ul>
        {region.crags.map((crag) => (
          <li key={`crag-${crag.id}`}>
            <Link href={`/crags/${crag.id}`}>{crag.name}</Link>
          </li>
        ))}
      </ul>
      <h3>Formations</h3>
      <ul>
        {region.formations.map((formation) => (
          <li key={`formation-${formation.id}`}>
            <Link href={`/formations/${formation.id}`}>{formation.name}</Link>
          </li>
        ))}
      </ul>
      <h3>Climbs</h3>
      <ul>
        {region.climbs.map((climb) => (
          <li key={`climb-${climb.id}`}>
            <Link href={`/climbs/${climb.id}`}>{climb.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


