import { move } from "@/crags/actions";
import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

const Query = graphql(`
  query MoveCragPageData(
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
    <div>
      <h1>Move <i>{crag.name}</i> to another region</h1>
      <form action={action}>
        <div>
          <label htmlFor="region-select">Select a region</label>
          <select id="region-select" defaultValue={crag.region?.id} name="region">
            <option value={undefined} label="None" />
            {regions.map(r => (
              <option key={r.id} value={r.id} label={r.name} />
            ))}
          </select>
        </div>
        <input type="submit" value="Save" />
      </form>
    </div>
  );
}
