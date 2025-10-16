import Breadcrumb from "@/components/ui/Breadcrumb";
import BreadcrumbItem from "@/components/ui/BreadcrumbItem";
import BreadcrumbPage from "@/components/ui/BreadcrumbPage";
import { graphql } from "@/gql";
import { graphqlQuery } from "@/graphql";

const Query = graphql(`
  query RegionBreadcrumbData(
    $id: ID!
  ) {
    region(id: $id) {
      name
    }
  }
`);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const data = await graphqlQuery(Query, { id });
  const { region } = data;

  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbPage>
          { region.name || <i>Anonymous region</i> }
        </BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}

