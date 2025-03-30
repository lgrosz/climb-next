import Link from 'next/link'
import VerminGrade from '@/vermin-grade'
import { graphqlQuery } from '@/graphql';
import FontainebleauGrade from '@/fontainebleau-grade';
import YosemiteDecimalGrade from '@/yosemite-decimal-grade';
import { graphql } from '@/gql';

const climbData = graphql(`
  query climbData($id: ID!) {
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
      ascents {
        id
        climber {firstName lastName }
        dateWindow
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
      }
    }
  }
`);

interface AscentRowProps {
  climber: {
    firstName: string,
    lastName: string,
  }
  dateWindow?: string | null
  grades: {
    __typename: string,
    font_value?: string
    v_value?: string
    yds_value?: string
  }[]
}

function AscentRow(props: AscentRowProps) {
  const fontGrades = props.grades.map(grade =>
    grade.__typename == "Fontainebleau" && grade.font_value ? FontainebleauGrade.fromString(grade.font_value) : undefined
  ).filter((g): g is FontainebleauGrade => !!g);

  const verminGrades = props.grades.map(grade =>
    grade.__typename == "Vermin" && grade.v_value ? VerminGrade.fromString(grade.v_value) : undefined
  ).filter((g): g is VerminGrade => !!g);

  const ydsGrades = props.grades.map(grade =>
    grade.__typename == "YosemiteDecimal" && grade.yds_value ? YosemiteDecimalGrade.fromString(grade.yds_value) : undefined
  ).filter((g): g is YosemiteDecimalGrade => !!g);

  const gradeString = [
    FontainebleauGrade.slashString(fontGrades),
    VerminGrade.slashString(verminGrades),
    YosemiteDecimalGrade.slashString(ydsGrades),
  ].filter(s => s).join(", ");

  return (
    <tr>
      <td>{props.climber.firstName} {props.climber.lastName}</td>
      <td>{props.dateWindow ?? "-"}</td>
      <td>{gradeString ? gradeString : "-" }</td>
    </tr>
  );
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await graphqlQuery(
    climbData,
    { id: params.id }
  );

  const { climb } = data;

  let parentHref: string | null = null;
  if (climb.parent?.__typename == "Formation") {
    parentHref = `/formations/${climb.parent.id}`
  } else if (climb.parent?.__typename == "Area") {
    parentHref = `/areas/${climb.parent.id}`
  }

  const fontGrades = climb.grades.map(grade =>
    grade.__typename == "Fontainebleau" && grade.font_value ? FontainebleauGrade.fromString(grade.font_value) : undefined
  ).filter((g): g is FontainebleauGrade => !!g);

  const verminGrades = climb.grades.map(grade =>
    grade.__typename == "Vermin" && grade.v_value ? VerminGrade.fromString(grade.v_value) : undefined
  ).filter((g): g is VerminGrade => !!g);

  const ydsGrades = climb.grades.map(grade =>
    grade.__typename == "YosemiteDecimal" && grade.yds_value ? YosemiteDecimalGrade.fromString(grade.yds_value) : undefined
  ).filter((g): g is YosemiteDecimalGrade => !!g);

  const ascents = climb.ascents;

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
      <h3>Ascents</h3>
      <table>
        <thead>
          <tr>
            <th>Climber</th>
            <th>Date</th>
            <th>Suggested Grade</th>
          </tr>
        </thead>
        <tbody>
          {ascents.map(ascent => (
            <AscentRow key={`ascent-${ascent.id}`} {...ascent}/>
          ))}
        </tbody>
      </table>
    </div>
  );
}

