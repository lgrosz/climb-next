import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";
import NewSectorModal from "./NewSectorModal";
import { toSectorParentOptions } from "@/app/sectors/new/SectorParentOptions";

const query = graphql(`
  query NewSectorModalData {
    regions { ...RegionSectorParentOptionFields }
    crags { ...CragSectorParentOptionFields }
  }
`);

export default async function Page() {
  const result = await graphqlQuery(query);
  const parentOptions = toSectorParentOptions(result);

  return (
    <NewSectorModal parentOptions={parentOptions} />
  )
}
