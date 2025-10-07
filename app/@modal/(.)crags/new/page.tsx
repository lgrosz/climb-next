import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";
import NewCragModal from "./NewCragModal";
import { toCragParentOptions } from "@/app/crags/new/CragParentOptions";

const query = graphql(`
  query NewCragModalData {
    regions { ...RegionCragParentOptionFields }
  }
`);

export default async function Page() {
  const result = await graphqlQuery(query);
  const parentOptions = toCragParentOptions(result);

  return (
    <NewCragModal parentOptions={parentOptions} />
  )
}
