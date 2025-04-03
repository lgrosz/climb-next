import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";
import Form from "next/form";
import { redirect } from "next/navigation";
import { removeGrade } from "@/climbs/actions";

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
    const id = formData.get("climb-id")?.toString();

    if (!id) {
      return;
    }

    // TODO notify of errors
    await Promise.all(Array.from(formData.entries()).map(([key, value]) => {
      if (key.startsWith("font-")) {
        return removeGrade(id, {
          fontainebleau: value.toString()
        });
      } else if (key.startsWith("vermin-")) {
        return removeGrade(id, {
          vermin: value.toString()
        });
      } else if (key.startsWith("yds-")) {
        return removeGrade(id, {
          yosemiteDecimal: value.toString()
        });
      }
    }));

    redirect(`/climbs/${id}`);
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
          <input
            type="checkbox"
            name={`font-${i}`}
            value={grade.font_value}
          />
          <label>{grade.font_value}</label>
        </div>
      ))}
      {verminGrades.map((grade, i) => (
        <div key={`v-${i}`}>
          <input
            type="checkbox"
            name={`vermin-${i}`}
            value={grade.v_value}
          />
          <label>{grade.v_value}</label>
        </div>
      ))}
      {ydsGrades.map((grade, i) => (
        <div key={`y-${i}`}>
          <input
            type="checkbox"
            name={`yds-${i}`}
            value={grade.yds_value}
          />
          <label>{grade.yds_value}</label>
        </div>
      ))}
      <button type="submit">Remove all</button>
    </Form>
  );
}
