import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";
import NewClimbModal from "./NewClimbModal";
import { toClimbParentOptions } from "@/app/climbs/new/ClimbParentOptions";

const query = graphql(`
  query NewClimbModalData {
    regions { ...RegionClimbParentOptionFields }
    crags { ...CragClimbParentOptionFields }
    formations { ...FormationClimbParentOptionFields }
  }
`);

export default async function Page() {
  const result = await graphqlQuery(query);
  const parentOptions = toClimbParentOptions(result);

  return (
    <NewClimbModal parentOptions={parentOptions} />
  )
}
