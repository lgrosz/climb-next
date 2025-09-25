import { graphqlQuery } from '@/graphql';
import { graphql } from '@/gql';
import Link from 'next/link';
import Header from './Header';
import Description from './Description';

const regionData = graphql(`
  query regionData($id: ID!) {
    region(
      id: $id
    ) {
      id name
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
      <Header id={region.id} name={region.name ?? undefined} />
      <Description id={region.id} description={region.description ?? undefined} />
      <h3>Crags</h3>
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


