"use client"

import { useState } from 'react'

interface StringArrayInputProperties {
  value: string[],
  onChange: (newValue: string[]) => void,
  addStringPlaceholder?: string,
}

export default function StringArrayInput(props: StringArrayInputProperties) {
  const [newString, setNewString] = useState("");

  const handleAddString = () => {
    if (newString.trim() === "") return
    const updatedStrings = [...(props.value || []), newString]
    props.onChange(updatedStrings)
    setNewString("")
  };

  const handleRemoveString = (index: number) => {
    const updatedStrings = props.value.filter((_, i) => i !== index)
    props.onChange(updatedStrings)
  };

  const handleUpdateString = (index: number, updatedString: string) => {
    const updatedStrings = props.value.map((str, i) => (i === index ? updatedString : str))
    props.onChange(updatedStrings)
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={newString}
          onChange={(e) => setNewString(e.target.value)}
          placeholder={props.addStringPlaceholder}
        />
        <button type="button" onClick={handleAddString}>Add String</button>
      </div>
      <ul>
        {props.value.map((name, index) => (
          <li key={index}>
            <input
              type="text"
              value={name}
              onChange={(e) => handleUpdateString(index, e.target.value)}
            />
            <button type="button" onClick={() => handleRemoveString(index)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
