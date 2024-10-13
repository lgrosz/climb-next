import Link from 'next/link'
import DeleteClimbButton from '@/components/DeleteClimbButton'
import AddClimbNameForm from '@/components/AddClimbNameForm'
import AddVerminGradeForm from '@/components/AddVerminGradeForm'
import RemoveClimbNameButton from '@/components/RemoveClimbNameButton'
import RemoveClimbVerminGradeButton from '@/components/RemoveClimbVerminGradeButton'
import VerminGrade from '@/vermin-grade'
import { GRAPHQL_ENDPOINT } from '@/constants'

async function ClimbNameListItem({ climbId, name, children }: { climbId: number, name: string, children: React.ReactNode }) {
  return (
    <li>
      <div>
        {children}
        <RemoveClimbNameButton climbId={climbId} name={name}>Remove</RemoveClimbNameButton>
      </div>
    </li>
  )
}

interface Grade {
  type: string,
  value: string,
}

interface Climb {
  id: number,
  names: string[],
  grades: Grade[],
  area: { id: number, names: string[] } | null,
  formation: { id: number, names: string[] } | null,
}

export default async function Page({ params }: { params: { id: string } }) {
  let {
    id,
    names,
    ...climb
  }: Climb = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `query GetClimb($id: Int!) {
        climb(
          id: $id
        ) {
          id names
          grades { type value }
          area { id names }
          formation { id names }
        }
      }`,
      variables: { id: parseInt(params.id) }
    })
  })
    .then(r => r.json())
    .then(json => json.data.climb)

  // We will treat the official name as the first of the names list
  const name = names.find(Boolean)

  const verminGrades: VerminGrade[] = climb.grades
    .map(grade => {
      if (grade.type === "VERMIN") {
        try {
          return VerminGrade.fromString(grade.value)
        } catch (error) {
          console.error("Failed to parse grade:", grade.value, error)
          return null
        }
      } else {
        return null
      }
    })
    .filter((grade): grade is VerminGrade => grade !== null);

  return (
    <div>
      <h1>Climb <i>{name}</i></h1>
      <h2>Grades</h2>
      {Boolean(verminGrades.length) &&
        <>
          <h3>Hueco</h3>
          <p>{VerminGrade.slashString(verminGrades)}</p>
          <ul>
          {verminGrades.map(grade => (
            <li>
              <span>{grade.toString()}</span>
              <RemoveClimbVerminGradeButton
                climbId={id}
                data={ { value: grade.getValue() } }
              >
                -
              </RemoveClimbVerminGradeButton>
            </li>
          ))}
          <li>
            <AddVerminGradeForm
              climbId={id}
            />
          </li>
          </ul>
        </>
      }
      <h2>Names</h2>
      <div>
        <ul>
          {names.map((name: string, index: number) => (
            <ClimbNameListItem key={index} climbId={id} name={name}>{name}</ClimbNameListItem>
          ))}
          <li>
            <AddClimbNameForm climbId={id} />
          </li>
        </ul>
      </div>
      <h2>{climb.area ? "Area" : climb.formation ? "Formation" : "No ancestor" }</h2>
      {climb.area ?
        <Link href={`/area/${climb.area.id}`}>{climb.area.names.find(Boolean) ?? "Unnamed"}</Link>
        : climb.formation ?
        <Link href={`/formation/${climb.formation.id}`}>{climb.formation.names.find(Boolean) ?? "Unnamed"}</Link>
        :
        "No ancestor"
      }
      <hr />
      <DeleteClimbButton climbId={id}>Delete <i>{name}</i></DeleteClimbButton>
    </div>
  )
}

