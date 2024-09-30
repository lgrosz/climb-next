import DeleteFormationButton from '@/components/DeleteFormationButton'
import AddFormationNameForm from '@/components/AddFormationNameForm'
import RemoveFormationNameButton from '@/components/RemoveFormationNameButton'
import { GRAPHQL_ENDPOINT } from '@/constants'
import Link from 'next/link'

async function FormationNameListItem({ formationId, name, children }: { formationId: number, name: string, children: React.ReactNode }) {
  return (
    <li>
      <div>
        {children}
        <RemoveFormationNameButton formationId={formationId} name={name}>Remove</RemoveFormationNameButton>
      </div>
    </li>
  )
}

interface Formation {
  id: number,
  names: string[],
  area: {
    id: number,
    names: string[]
  } | null,
  superFormation: {
    id: number,
    names: string[]
  },
  subFormations: {
    id: number,
    names: string[]
  }[],
  climbs: {
    id: number,
    names: string[]
  }[],
}

export default async function Page({ params }: { params: { id: string } }) {
  let formation: Formation = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `query GetFormation($id: Int!) {
        formation(
          id: $id
        ) {
          id names
          area { id names }
          superFormation { id names }
          subFormations { id names }
          climbs { id names }
        }
      }`,
      variables: { id: parseInt(params.id) }
    })
  })
    .then(r => r.json())
    .then(json => json.data.formation)

  // We will treat the official name as the first of the names list
  const name = formation.names.find(Boolean)

  return (
    <div>
      <h1>Formation <i>{name}</i></h1>
      <h2>Names</h2>
      <div>
        <ul>
          {formation.names.map((name: string, index: number) => (
            <FormationNameListItem key={index} formationId={formation.id} name={name}>{name}</FormationNameListItem>
          ))}
        </ul>
        <AddFormationNameForm formationId={formation.id} />
      </div>
      <h2>Sub Formations</h2>
      {formation.subFormations.length < 1 ? <p>No sub formations</p> : null}
      <ul>
        {formation.subFormations.map((subformation) => (
          <li key={`subformation-${subformation.id}`}>
            <Link href={`/formation/${subformation.id}`}>{subformation.names.find(Boolean) ?? "Unnamed"}</Link>
          </li>
        ))}
        { /* TODO add-subarea by linking to create area form with some query parameters */ }
      </ul>
      <h2>{formation.area ? "Area" : "Super Formation"}</h2>
      {formation.area ?
        <Link href={`/area/${formation.area.id}`}>{formation.area.names.find(Boolean) ?? "Unnamed"}</Link>
        : formation.superFormation ?
        <Link href={`/formation/${formation.superFormation.id}`}>{formation.superFormation.names.find(Boolean) ?? "Unnamed"}</Link>
        :
        <Link href={`/formations`}>Back to formations</Link>
      }
      <h2>Climbs</h2>
      {formation.climbs.length < 1 ? <p>No climbs</p> : null}
      <ul>
        {formation.climbs.map((climb) => (
          <li key={`climb-${climb.id}`}>
            <Link href={`/climb/${climb.id}`}>{climb.names.find(Boolean) ?? "Unnamed"}</Link>
          </li>
        ))}
        { /* TODO add-climb by linking to create climb form with some query parameters */ }
      </ul>
      <hr />
      <DeleteFormationButton formationId={formation.id}>Delete <i>{name}</i></DeleteFormationButton>
    </div>
  )
}

