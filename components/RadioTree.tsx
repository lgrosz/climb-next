import { DetailedHTMLProps, InputHTMLAttributes } from "react";

interface RadioTreeNode {
  input: Omit<
    DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    "type"
  >;
  nodes?: RadioTreeNode[],
  label?: React.ReactNode,
}

const radios = async (nodes: RadioTreeNode[]) => {
  return nodes.map(node => (
    <div key={node.input.id}>
      <input type="radio" {...node.input} />
      <label htmlFor={node.input.id}>
	{ node.label ?? node.input.value }
      </label>
      {(node.nodes?.length ?? 0) > 0 && (
	<div style={{ paddingLeft: "20px" }}>
	  { radios(node.nodes ?? []) }
	</div>
      )}
    </div>
  ));
}

async function RadioTree({ nodes }: { nodes: RadioTreeNode[] })
{
  return (
    <div>
      { radios(nodes) }
    </div>
  );
}

export default RadioTree;
export type { RadioTreeNode };
