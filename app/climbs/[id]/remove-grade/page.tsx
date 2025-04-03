import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";
import Form from "next/form";

const query = graphql(`
  query climbGrades(
    $id: ID!
  ) {
    climb(id: $id) {
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
`);

export default async function Page(
  props: {
    params: Promise<{
      id: string,
    }>
  }
) {
  const { id } = await props.params;

  const action = async (formData: FormData) => {
    'use server';

    formData.forEach((value, key) => {
      // TODO it'd be better to batch these
      // if key starts with font-
      //   - remove font grade
      // if key starts with verm-
      //   - remove verm grade
      // if key starts with yds-
      //   - remove yds grade
    });
  }

  const data = await graphqlQuery(
    query,
    { id: id }
  );

  const { climb } = data;
  const { grades } = climb;
  const verminGrades = grades.filter(grade => grade.__typename == "Vermin");
  const fontGrades = grades.filter(grade => grade.__typename == "Fontainebleau");
  const ydsGrades = grades.filter(grade => grade.__typename == "YosemiteDecimal");

  return (
    <Form action={action}>
      <input type="hidden" name="climb-id" value={id}/>
      {fontGrades.map((grade, i) => (
        <div key={`f-${i}`}>
          <input type="checkbox" value={`font-${grade.font_value}`} />
          <label>{grade.font_value}</label>
        </div>
      ))}
      {verminGrades.map((grade, i) => (
        <div key={`v-${i}`}>
          <input type="checkbox" value={`vermin-${grade.v_value}`} />
          <label>{grade.v_value}</label>
        </div>
      ))}
      {ydsGrades.map((grade, i) => (
        <div key={`y-${i}`}>
          <input type="checkbox" value={`yds-${grade.yds_value}`} />
          <label>{grade.yds_value}</label>
        </div>
      ))}
      <button type="submit">Remove all</button>
    </Form>
  );
}
