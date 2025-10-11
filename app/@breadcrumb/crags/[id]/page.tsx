import Breadcrumb from "@/components/ui/Breadcrumb";
import BreadcrumbLink from "@/components/ui/BreadcrumbLink";
import BreadcrumbPage from "@/components/ui/BreadcrumbPage";
import BreadcrumbSeparator from "@/components/ui/BreadcrumbSeparator";
import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

const Query = graphql(`
  query CragBreadcrumbData(
    $id: ID!
  ) {
    crag(id: $id) {
      name
      region {
        id name
      }
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const data = await graphqlQuery(Query, { id });
  const { crag } = data;
  const region = crag.region;

  return (
    <Breadcrumb>
      {region &&
        <>
          <BreadcrumbLink href={`/regions/${region.id}`}>{region.name}</BreadcrumbLink>
          <BreadcrumbSeparator />
        </>
      }
      <BreadcrumbPage>
        { crag.name }
      </BreadcrumbPage>
    </Breadcrumb>
  );
}

