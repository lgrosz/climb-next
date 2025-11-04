import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";
import Link from "next/link";

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
    <div className="w-full p-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
      <Breadcrumb>
        <BreadcrumbList>
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
          <BreadcrumbItem>
            <BreadcrumbPage>
              { crag.name || <i>Anonymous crag</i> }
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Link href={`/crags/${id}/move`}>Move</Link>
    </div>
  );
}

