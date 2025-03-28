import Form from 'next/form';
import { move } from '@/areas/actions';
import { redirect } from 'next/navigation';
import { graphqlQuery } from '@/graphql';
import RadioTree, { RadioTreeNode } from '@/components/RadioTree';
import { graphql } from '@/gql';

// TODO this is a snippet copied from the generated graphql types, I think this
// is where "fragments" are helpful
const potentialAreaParents = graphql(`
  query potentialAreaParents {
    potentialParents: areas {
      id name
      parent { ... on Area { id } }
    }
  }
`);

type PotentialAreaParents = {
    __typename?: "Area";
    id: string;
    name?: string | null;
    parent?: {
        __typename?: "Area";
        id: string;
    } | null;
}[];

function buildTree(parents: PotentialAreaParents, disabledId: string) {
  const roots: RadioTreeNode[] = [];
  const map = new Map<string, RadioTreeNode>();

  // Populate radio-tree nodes
  parents.forEach(parent => {
    map.set(parent.id!, {
      input: {
        id: parent.id!.toString(),
        name: "parent",
        value: parent.id!.toString(),
      },
      label: parent.name,
    });
  });

  // Build radio-tree node tree
  parents.forEach(item => {
    const child = map.get(item.id!);
    console.log(child?.label);

    if (!child) {
      return;
    }

    if (item.parent) {
      const parent = map.get(item.parent.id!);

      if (child && parent) {
        (parent.nodes ??= []).push(child);
      }
    } else {
      roots.push(child);
    }
  });

  // disable nodes
  const disableSubtree = (node: RadioTreeNode) => {
    node.input.disabled = true;
    node.nodes?.forEach(disableSubtree);
  };

  const rootToDisable = map.get(disabledId);
  if (rootToDisable) {
    disableSubtree(rootToDisable);
  }

  return roots;
}

// TODO
// I think most of this can become an "area" selector.. like it'd be useful
// when creating an area to select from this tree than it is to just type in
// an id
export default async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id

  const data = await graphqlQuery(potentialAreaParents)

  const { potentialParents } = data;

  const action = async (data: FormData) => {
    'use server';

    // always assuming the parent is an area
    const parentId = Number(data.get('parent')) || null;

    await move(
      id,
      parentId ?
        { area: parentId } :
        null
    );

    redirect(`/areas/${id}`);
  }

  const roots = [
    ...buildTree(potentialParents, id),
    {
      input: {
        id: "node",
        name: "parent",
        value: "none",
      },
      label: "None",
    }
  ];

  return (
    <Form action={action}>
      <RadioTree nodes={roots} />
      <button type="submit">Move</button>
    </Form>
  )
}
