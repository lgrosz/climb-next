import Breadcrumb from "@/components/ui/Breadcrumb";
import BreadcrumbItem from "@/components/ui/BreadcrumbItem";
import BreadcrumbLink from "@/components/ui/BreadcrumbLink";
import BreadcrumbPage from "@/components/ui/BreadcrumbPage";
import BreadcrumbSeparator from "@/components/ui/BreadcrumbSeparator";
import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

const Query = graphql(`
  query ClimbBreadcrumbData(
    $id: ID!
  ) {
    climb(id: $id) {
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
        ... on Formation {
          id name
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
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const data = await graphqlQuery(Query, { id });
  const { climb } = data;

  let region: { id: string; name?: string | null } | null = null;
  let crag: { id: string; name?: string | null } | null = null;
  let sector: { id: string; name?: string | null } | null = null;
  let formation: { id: string; name?: string | null } | null = null;

  const parent = climb.parent;

  // gross
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
      region = parent.crag?.region ?? null;
      break;
    case "Formation":
      formation = parent;
      switch (parent.parent?.__typename) {
        case "Region":
          region = parent.parent;
          break;
        case "Crag":
          crag = parent.parent;
          region = parent.parent.region ?? null;
          break;
        case "Sector":
          sector = parent.parent;
          crag = parent.parent.crag ?? null;
          region = parent.parent.crag?.region ?? null;
          break;
      }
      break;
  }

  return (
    <Breadcrumb>
      {region &&
        <>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/regions/${region.id}`}>
              { region.name || <i>Anonymous region</i> }
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </>
      }
      {crag &&
        <>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/crags/${crag.id}`}>
              { crag.name || <i>Anonymous crag</i> }
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </>
      }
      {sector &&
        <>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/sectors/${sector.id}`}>
              { sector.name || <i>Anonymous sector</i> }
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </>
      }
      {formation &&
        <>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/formations/${formation.id}`}>
              {formation.name || <i>Anonymous formation</i>}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </>
      }
      <BreadcrumbItem>
        <BreadcrumbPage>
          { climb.name || <i>Anonymous climb</i> }
        </BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}

