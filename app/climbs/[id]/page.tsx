import Link from 'next/link'
import VerminGrade from '@/vermin-grade'
import { GRAPHQL_ENDPOINT } from '@/constants'
import { query } from '@/graphql';
import { Climb } from '@/graphql/schema';

const dataQuery = `
  query($id: Int!) {
    climb(
      id: $id
    ) {
      id name description
      grades {
        ... on VerminGrade { value }
      }
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

  const { climb }: { climb: Climb } = data;

  let parentHref: string | null = null;
  if (climb?.parent?.__typename == "Formation") {
    parentHref = `/formations/${climb.parent.id}`
  } else if (climb?.parent?.__typename == "Area") {
    parentHref = `/areas/${climb.parent.id}`
  }

  const verminGrades: VerminGrade[] = climb.grades?.map(grade =>
    grade.value ? new VerminGrade(grade.value) : undefined
  )?.filter((g): g is VerminGrade => !!g) ?? [];

  return (
    <div>
      <div>
        <h1>
          {
            climb.name ??
            <i>Unnamed climb</i>
          }
        </h1>
        <Link href={`/climbs/${climb.id}/rename`}>Rename</Link>
      </div>
      <div>
        {
          climb.parent ?
          <h2><Link href={`${parentHref}`}>{climb.parent.name}</Link></h2> :
          null
        }
        <Link href={`/climbs/${climb.id}/move`}>Move</Link>
      </div>
      <div>
        <h3>Description</h3>
        <p>
          {
            climb.description ??
            <i>No description available</i>
          }
        </p>
        <Link href={`/climbs/${climb.id}/describe`}>Describe</Link>
      </div>
      <h3>Grades</h3>
      {verminGrades.length > 0 && (
        <ul>
          <li>{VerminGrade.slashString(verminGrades)}</li>
        </ul>
      )}
    </div>
  );
}

