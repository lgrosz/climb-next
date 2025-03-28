import Form from 'next/form';
import { move } from '@/climbs/actions';
import { redirect } from 'next/navigation';
import RadioTree, { RadioTreeNode } from '@/components/RadioTree';
import { graphqlQuery } from '@/graphql';
import { graphql } from '@/gql';

const potentialClimbParents = graphql(`
  query potentialClimbParents {
    potentialParentAreas: areas {
      __typename
      id name
      parent {
        __typename
        ... on Area { id }
      }
    }
    potentialParentFormations: formations {
      __typename
      id name
      parent {
        __typename
        ... on Area { id }
        ... on Formation { id }
      }
    }
  }
`);

// TODO graphql-codegen fragment
type Area = {
    __typename: "Area";
    id: string;
    name?: string | null;
    parent?: {
        __typename: "Area";
        id: string;
    } | null;
};

// TODO graphql-codegen fragment
type Formation = {
    __typename: "Formation";
    id: string;
    name?: string | null;
    parent?: {
        __typename: "Area";
        id: string;
    } | {
        __typename: "Formation";
        id: string;
    } | null;
};

function buildTree(parents: (Area | Formation)[]) {
  const roots: RadioTreeNode[] = [];
  const map = new Map<string, RadioTreeNode>();

  // Populate radio-tree nodes
  parents.forEach(parent => {
    const id = `${parent.__typename}/${parent.id}`

    map.set(id, {
      input: {
        id: id,
        name: "parent",
        value: id,
      },
      label: parent.name,
    });
  });

  // Build radio-tree node tree
  parents.forEach(item => {
    const id = `${item.__typename}/${item.id}`
    const child = map.get(id);

    if (!child) {
      return;
    }

    if (item.parent) {
      const parentId = `${item.parent.__typename}/${item.parent.id}`
      const parent = map.get(parentId);

      if (child && parent) {
        (parent.nodes ??= []).push(child);
      }
    } else {
      roots.push(child);
    }
  });

  return roots;
}

// TODO
// I think most of this can become an "area" selector.. like it'd be useful
// when creating an area to select from this tree than it is to just type in
// an id
export default async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = parseInt(params.id);

  const data = await graphqlQuery(potentialClimbParents);

  const { potentialParentAreas, potentialParentFormations } = data;

  const action = async (data: FormData) => {
    'use server';

    const input = data.get('parent')?.toString() ?? '';

    const match = input.match(/^([^/]+)\/(\d+)$/);

    // Define the valid types
    type ValidType = 'Area' | 'Formation';

    const isValidType = (type: string): type is ValidType =>
      type === 'Area' || type === 'Formation';

    const parent = match && isValidType(match[1])
      ? { __typename: match[1], id: parseInt(match[2], 10) }
      : null;

    await move(id, parent);

    redirect(`/climbs/${id}`);
  }

  const roots = [
    ...buildTree([...potentialParentAreas, ...potentialParentFormations]),
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

