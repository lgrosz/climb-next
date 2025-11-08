import VerminGrade from '@/vermin-grade'
import { graphqlQuery } from '@/graphql';
import FontainebleauGrade from '@/fontainebleau-grade';
import YosemiteDecimalGrade from '@/yosemite-decimal-grade';
import { FragmentType, getFragmentData, graphql } from '@/gql';
import Header from './Header';
import Description from './Description';
import AscentList from '@/components/AscentList';

const AscentFragmentType = graphql(`
  fragment AscentTableDataFragment on Ascent {
    id
    ascentWindow
    firstAscent
    verified
    party {
      complete
      members {
        firstName
        lastName
      }
    }
  }
`);

export function fragmentAsAscentTableProp(frag: Array<FragmentType<typeof AscentFragmentType>>) {
  const a = getFragmentData(AscentFragmentType, frag);
  return a.map(d => ({
    id: d.id,
    ascentWindow: d.ascentWindow || undefined,
    firstAscent: d.firstAscent,
    verified: d.verified,
    party: {
      complete: d.party.complete,
      members: d.party.members.map(m => ({
        firstName: m.firstName ?? "",
        lastName: m.lastName ?? "",
      })),
    },
  }));
}

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
      ascents {
        ...AscentTableDataFragment
      }
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await graphqlQuery(
    climbData,
    { id: params.id }
  );

  const { climb } = data;

  const fontGrades = climb.grades.map(grade =>
    grade.__typename == "Fontainebleau" && grade.font_value ? FontainebleauGrade.fromString(grade.font_value) : undefined
  ).filter((g): g is FontainebleauGrade => !!g).sort(FontainebleauGrade.compare);

  const verminGrades = climb.grades.map(grade =>
    grade.__typename == "Vermin" && grade.v_value ? VerminGrade.fromString(grade.v_value) : undefined
  ).filter((g): g is VerminGrade => !!g).sort(VerminGrade.compare);

  const ydsGrades = climb.grades.map(grade =>
    grade.__typename == "YosemiteDecimal" && grade.yds_value ? YosemiteDecimalGrade.fromString(grade.yds_value) : undefined
  ).filter((g): g is YosemiteDecimalGrade => !!g).sort(YosemiteDecimalGrade.compare);

  return (
    <div>
      <Header id={climb.id} name={climb.name ?? undefined} />
      <Description id={climb.id} description={climb.description ?? undefined} />
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
      <div className="overflow-x-auto">
        <AscentList climbId={climb.id} ascents={fragmentAsAscentTableProp(climb.ascents)}/>
      </div>
    </div>
  );
}

