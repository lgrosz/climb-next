import Breadcrumb from "@/components/ui/Breadcrumb";
import BreadcrumbLink from "@/components/ui/BreadcrumbLink";
import BreadcrumbPage from "@/components/ui/BreadcrumbPage";
import BreadcrumbSeparator from "@/components/ui/BreadcrumbSeparator";
import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

const Query = graphql(`
  query FormationBreadcrumbData(
    $id: ID!
  ) {
    formation(id: $id) {
      name
      parent {
        __typename
        ... on Region { id name }
        ... on Crag {
          id name
          region { id name }
        }
        ... on Sector {
          id name
          crag {
            id name
            region { id name }
          }
        }
      }
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const data = await graphqlQuery(Query, { id });
  const { formation } = data;

  let region: { id: string; name?: string | null } | null = null;
  let crag: { id: string; name?: string | null } | null = null;
  let sector: { id: string; name?: string | null } | null = null;

  const parent = formation.parent;

  switch (parent?.__typename) {
    case "Region":
      region = parent;
      break;
    case "Crag":
      crag = parent;
      region = parent.region ?? null;
      break;
    case "Sector":
      sector = parent;
      crag = parent.crag ?? null;
      region = parent?.crag?.region ?? null;
      break;
  }

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
      {sector &&
        <>
          <BreadcrumbLink href={`/sectors/${sector.id}`}>{sector.name}</BreadcrumbLink>
          <BreadcrumbSeparator />
        </>
      }
      <BreadcrumbPage>
        { formation.name }
      </BreadcrumbPage>
    </Breadcrumb>
  );
}

