'use client'

import { ElementType, useState } from "react"

interface Props {
  name?: string,
  as?: ElementType,
  rename: (_: string) => Promise<string>,
}

export default ({ name = "", as: Tag = "h1", rename }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [headerText, setHeaderText] = useState(name);
  const [editText, setEditText] = useState(name);

  const save = async () => {
    try {
      const name = await rename(editText.trim());
      setHeaderText(name);
      setEditText(name);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const edit = () => {
    setEditText(headerText);
    setIsEditing(true);
  }

  const cancel = () => {
    setIsEditing(false);
  }

  return (
    <div>
      {
        isEditing ? (
          <div>
            <input
              type="text"
              value={editText ?? ""}
              onChange={(e) => setEditText(e.target.value)}
            />
            <button onClick={() => save()}>Save</button>
            <button onClick={() => cancel()}>Cancel</button>
          </div>
        ) : (
          <div>
            <Tag>{headerText || <i>Unnamed</i>}</Tag>
            <button onClick={() => edit()}>Edit</button>
          </div>
        )
      }
    </div>
  )
}