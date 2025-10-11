import Breadcrumb from "@/components/ui/Breadcrumb";
import BreadcrumbLink from "@/components/ui/BreadcrumbLink";
import BreadcrumbPage from "@/components/ui/BreadcrumbPage";
import BreadcrumbSeparator from "@/components/ui/BreadcrumbSeparator";
import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

const Query = graphql(`
  query SectorBreadcrumbData(
    $id: ID!
  ) {
    sector(id: $id) {
      name
      crag {
        id name
        region {
          id name
        }
      }
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const data = await graphqlQuery(Query, { id });
  const { sector } = data;
  const crag = sector.crag;
  const region = crag?.region;

  return (
    <Breadcrumb>
      {region &&
        <>
          <BreadcrumbLink href={`/regions/${region.id}`}>{region.name}</BreadcrumbLink>
          <BreadcrumbSeparator />
        </>
      }
      {crag &&
        <>
          <BreadcrumbLink href={`/crags/${crag.id}`}>{crag.name}</BreadcrumbLink>
          <BreadcrumbSeparator />
        </>
      }
      <BreadcrumbPage>
        { sector.name }
      </BreadcrumbPage>
    </Breadcrumb>
  );
}

