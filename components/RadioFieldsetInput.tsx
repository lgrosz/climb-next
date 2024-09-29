"use client"

interface RadioInputProperties {
  id?: string,
  name?: string,
  value?: string | number | readonly string[]
  label?: string
}

interface RadioFieldsetInputProperties {
  value: string | number | readonly string[] | undefined,
  onChange: (newValue: string | number | readonly string[] | undefined) => void,
  values: RadioInputProperties[],
  caption?: string
}

export default function RadioFieldsetInput(props: RadioFieldsetInputProperties) {
  return (
    <fieldset>
      {props.caption ? <legend>{props.caption}</legend> : null}
      {props.values.map((value, index) => (
        <div key={index}>
          <input
            type="radio"
            id={value.id}
            name={value.name}
            checked={props.value == value.value}
            value={value.value}
            onChange={() => props.onChange(value.value)}
          />
          <label htmlFor={value.label}>
            {value.label}
          </label>
        </div>
      ))}
    </fieldset>
  );
};
