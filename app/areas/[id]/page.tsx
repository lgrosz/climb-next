import { GRAPHQL_ENDPOINT } from '@/constants'
import Link from 'next/link'
import { query } from '@/graphql'
import RenameHeader from '@/components/RenameHeader';
import EditableTextArea from '@/components/EditableTextArea';
import {
  rename as renameArea,
  describe as describeArea,
} from '@/areas/actions';

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
  description: string | null,
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

  const { area }: { area: Area } = data;

  let parentHref: string | null = null;
  if (area?.parent?.__typename == "Area") {
    parentHref = `/areas/${area.parent.id}`
  }

  const rename = async (name: string) => {
    'use server';
    return await renameArea(area.id, name);
  }

  const describe = async (description: string) => {
    'use server';
    return await describeArea(area.id, description);
  }

  return (
    <div>
      <RenameHeader
        name={area.name ?? ""}
        placeholder="Unnamed area"
        as="h1"
        rename={rename}
      />
      {
        area.parent ?
        <h2><Link href={`${parentHref}`}>{area.parent.name}</Link></h2> :
        null
      }
      <div>
        <h3>Description</h3>
        <EditableTextArea
          text={area.description ?? ""}
          placeholder="No description available"
          as="p"
          onSave={describe}
        />
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

