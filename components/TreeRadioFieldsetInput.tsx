"use client";

export interface ValueNode {
  props: RadioInputProperties;
  children: ValueNode[];
}

interface RadioInputProperties {
  id?: string;
  name?: string;
  value?: string | number | readonly string[];
  label?: string;
}

interface RadioFieldsetInputProperties {
  value: string | number | readonly string[] | undefined;
  onChange: (newValue: string | number | readonly string[] | undefined) => void;
  nodes: ValueNode[];
  caption?: string;
}

function RadioNode({
  node,
  value,
  onChange
}: {
  node: ValueNode;
  value: string | number | readonly string[] | undefined;
  onChange: (newValue: string | number | readonly string[] | undefined) => void;
}) {
  return (
    <li>
      <input
        type="radio"
        id={node.props.id}
        name={node.props.name}
        checked={value == node.props.value}
        value={node.props.value}
        onChange={() => onChange(node.props.value)}
      />
      <label htmlFor={node.props.id}>{node.props.label}</label>
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((childNode, index) => (
            <RadioNode
              key={index}
              node={childNode}
              value={value}
              onChange={onChange}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function RadioFieldsetInput(props: RadioFieldsetInputProperties) {
  return (
    <fieldset>
      {props.caption ? <legend>{props.caption}</legend> : null}
      <ul>
        {props.nodes.map((node, index) => (
          <RadioNode
            key={index}
            node={node}
            value={props.value}
            onChange={props.onChange}
          />
        ))}
      </ul>
    </fieldset>
  );
}

