import Link from 'next/link'
import VerminGrade from '@/vermin-grade'
import { GRAPHQL_ENDPOINT } from '@/constants'
import { query } from '@/graphql';
import {
  Climb,
  Vermin,
  Fontainebleau,
  YosemiteDecimal,
} from '@/graphql/schema';
import FontainebleauGrade from '@/fontainebleau-grade';
import YosemiteDecimalGrade from '@/yosemite-decimal-grade';

// since the grades are aliased.. I have to tweak the expected schema
interface CustomClimbVerminGrade extends Omit<Vermin, "value"> { v_value?: string }
interface CustomClimbFontainebleauGrade extends Omit<Fontainebleau, "value"> { font_value?: string }
interface CustomClimbYosemiteDecimalGrade extends Omit<YosemiteDecimal, "value"> { yds_value?: string }
type CustomClimbGrade = CustomClimbFontainebleauGrade | CustomClimbVerminGrade | CustomClimbYosemiteDecimalGrade;
interface CustomClimb extends Omit<Climb, "grades"> { grades?: CustomClimbGrade[] }

const dataQuery = `
  query($id: Int!) {
    climb(
      id: $id
    ) {
      id name description
      grades {
        ... on Fontainebleau {
          __typename
          font_value: value
        }
        ... on Vermin {
          __typename
          v_value: value
        }
        ... on YosemiteDecimal {
          __typename
          yds_value: value
        }
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

  const { climb }: { climb: CustomClimb } = data;

  let parentHref: string | null = null;
  if (climb?.parent?.__typename == "Formation") {
    parentHref = `/formations/${climb.parent.id}`
  } else if (climb?.parent?.__typename == "Area") {
    parentHref = `/areas/${climb.parent.id}`
  }

  const fontGrades: FontainebleauGrade[] = climb.grades?.map(grade =>
    grade.__typename == "Fontainebleau" && grade.font_value ? FontainebleauGrade.fromString(grade.font_value) : undefined
  )?.filter((g): g is FontainebleauGrade => !!g) ?? [];

  const verminGrades: VerminGrade[] = climb.grades?.map(grade =>
    grade.__typename == "Vermin" && grade.v_value ? VerminGrade.fromString(grade.v_value) : undefined
  )?.filter((g): g is VerminGrade => !!g) ?? [];

  const ydsGrades: YosemiteDecimalGrade[] = climb.grades?.map(grade =>
    grade.__typename == "YosemiteDecimal" && grade.yds_value ? YosemiteDecimalGrade.fromString(grade.yds_value) : undefined
  )?.filter((g): g is YosemiteDecimalGrade => !!g) ?? [];

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
      {(fontGrades.length > 0 || verminGrades.length > 0 || ydsGrades.length > 0) && (
        <ul>
        {fontGrades.length > 0 && (
          <li>{FontainebleauGrade.slashString(fontGrades)}</li>
        )}
        {verminGrades.length > 0 && (
          <li>{VerminGrade.slashString(verminGrades)}</li>
        )}
        {ydsGrades.length > 0 && (
          <li>{YosemiteDecimalGrade.slashString(ydsGrades)}</li>
        )}
        </ul>
      )}
    </div>
  );
}

