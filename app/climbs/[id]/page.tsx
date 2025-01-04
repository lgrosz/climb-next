import Link from 'next/link'
import VerminGrade from '@/vermin-grade'
import { GRAPHQL_ENDPOINT } from '@/constants'
import { query } from '@/graphql'

interface ClimbParent {
  __typename: string,
  id: number,
  name: string,
}

interface VerminGradeData {
  value: number,
}

type GradeData = VerminGradeData;

interface Climb {
  id: number,
  name: string | null,
  parent: ClimbParent | null,
  grades: GradeData[],
}

const dataQuery = `
  query($id: Int!) {
    climb(
      id: $id
    ) {
      id name
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

export default async function Page({ params }: { params: { id: string } }) {
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

  const verminGrades: VerminGrade[] = climb.grades.map(grade => new VerminGrade(grade.value));

  return (
    <div>
      {
        climb.name ?
        <h1>{climb.name}</h1> :
        <h1><i>Unnamed Climb</i></h1>
      }
      {
        climb.parent ?
        <h2><Link href={`${parentHref}`}>{climb.parent.name}</Link></h2> :
        null
      }
      <h3>Grades</h3>
      <ul>
      {
        verminGrades.length > 0 ?
        <li>{VerminGrade.slashString(verminGrades)}</li> :
        null
      }
      </ul>
    </div>
  );
}

