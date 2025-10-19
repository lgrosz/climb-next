import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";
import AscentForm from "./AscentForm";
import { submitNewAscentForm } from "./actions";

const query = graphql(`
  query AddAscentPageData($id: ID!) {
    climb(id: $id) { name }
    climbers {
      id firstName lastName
    }
  }
`);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await graphqlQuery(query, { id });
  const { climb, climbers } = result;

  const action = async (formData: FormData) => {
    "use server";
    formData.set("climb", id);
    await submitNewAscentForm(formData);
  }

  return (
    <div>
      <h1>Add ascent for {climb.name || <i>Anonymous formation</i>}</h1>
      <AscentForm
        id="new-ascent-form"
        action={action}
        climbers={climbers.map(c => ({
          id: c.id,
          firstName: c.firstName ?? "",
          lastName: c.lastName ?? "",
        }))}
      />
      <div className="flex justify-end">
        <button form="new-ascent-form" type="submit">
          Create
        </button>
      </div>
    </div>
  );
}
