import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";
import NewFormationModal from "./NewFormationModal";
import { toFormationParentOptions } from "@/app/formations/new/FormationParentOptions";

const query = graphql(`
  query NewFormationModalData {
    regions { ...RegionFormationParentOptionFields }
    crags { ...CragFormationParentOptionFields }
  }
`);

export default async function Page() {
  const result = await graphqlQuery(query);
  const parentOptions = toFormationParentOptions(result);

  return (
    <NewFormationModal parentOptions={parentOptions} />
  )
}
