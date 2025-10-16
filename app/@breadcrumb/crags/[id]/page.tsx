import Breadcrumb from "@/components/ui/Breadcrumb";
import BreadcrumbItem from "@/components/ui/BreadcrumbItem";
import BreadcrumbLink from "@/components/ui/BreadcrumbLink";
import BreadcrumbPage from "@/components/ui/BreadcrumbPage";
import BreadcrumbSeparator from "@/components/ui/BreadcrumbSeparator";
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
      </Breadcrumb>
      <Link href={`/crags/${id}/move`}>Move</Link>
    </div>
  );
}

