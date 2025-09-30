import { graphqlQuery } from '@/graphql';
import { graphql } from '@/gql';
import Link from 'next/link';
import Header from './Header';
import Description from './Description';

const cragData = graphql(`
  query cragData($id: ID!) {
    crag(
      id: $id
    ) {
      id name
      description
      sectors { id name }
      formations { id name }
      climbs { id name }
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await graphqlQuery(
    cragData,
    { id: params.id }
  );

  const { crag } = data;

  return (
    <div>
      <Header id={crag.id} name={crag.name ?? undefined} />
      <Description id={crag.id} description={crag.description ?? undefined} />
      <h3>Sectors</h3>
      <ul>
        <li>
          <Link href={`/sectors/new?crag=${crag.id}`}>Add sector</Link>
        </li>
        <hr />
        {crag.sectors.map((sector) => (
          <li key={`sector-${sector.id}`}>
            <Link href={`/sectors/${sector.id}`}>{sector.name}</Link>
          </li>
        ))}
      </ul>
      <h3>Formations</h3>
      <ul>
        {crag.formations.map((formation) => (
          <li key={`formation-${formation.id}`}>
            <Link href={`/formations/${formation.id}`}>{formation.name}</Link>
          </li>
        ))}
      </ul>
      <h3>Climbs</h3>
      <ul>
        {crag.climbs.map((climb) => (
          <li key={`climb-${climb.id}`}>
            <Link href={`/climbs/${climb.id}`}>{climb.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


