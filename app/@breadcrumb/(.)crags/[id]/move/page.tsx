import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";
import MoveCragForm from "./MoveCragForm";
import { move } from "@/crags/actions";

const Query = graphql(`
  query MoveCragBreadcrumbData(
    $id: ID!
  ) {
    crag(id: $id) {
      name
      region {
        id name
      }
    }
    regions {
      id name
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const data = await graphqlQuery(Query, { id });
  const { crag } = data;
  const regions = data.regions.map(r => ({ name: r.name ?? undefined, id: r.id }));

  const action = async (formData: FormData) => {
    "use server";
    const region = formData.get("region")?.toString() || undefined;

    return await move(id, region || null);
  }

  return (
    <MoveCragForm
      action={action}
      crag={{ name: crag.name || undefined }}
      defaultRegionId={crag.region?.id}
      regions={regions}
    />
  );
}
