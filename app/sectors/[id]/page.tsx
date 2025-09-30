import { graphqlQuery } from '@/graphql';
import { graphql } from '@/gql';
import Link from 'next/link';
import Header from './Header';
import Description from './Description';

const sectorData = graphql(`
  query sectorData($id: ID!) {
    sector(
      id: $id
    ) {
      id name
      description
      formations { id name }
      climbs { id name }
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await graphqlQuery(
    sectorData,
    { id: params.id }
  );

  const { sector } = data;

  return (
    <div>
      <Header id={sector.id} name={sector.name ?? undefined} />
      <Description id={sector.id} description={sector.description ?? undefined} />
      <h3>Formations</h3>
      <ul>
        <li>
          <Link href={`/formations/new?sector=${sector.id}`}>Add formation</Link>
        </li>
        <hr />
        {sector.formations.map((formation) => (
          <li key={`formation-${formation.id}`}>
            <Link href={`/formations/${formation.id}`}>{formation.name}</Link>
          </li>
        ))}
      </ul>
      <h3>Climbs</h3>
      <ul>
        {sector.climbs.map((climb) => (
          <li key={`climb-${climb.id}`}>
            <Link href={`/climbs/${climb.id}`}>{climb.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


