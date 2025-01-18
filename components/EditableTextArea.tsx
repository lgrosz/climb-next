'use client'

import { ElementType, useState } from "react"

interface Props {
  text?: string,
  placeholder?: string,
  as?: ElementType,
  onSave: (_: string) => Promise<void>,
}

export default ({
  text = "",
  placeholder = "",
  as: Tag = "h1",
  onSave
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [areaText, setAreaText] = useState(text);
  const [editText, setEditText] = useState(text);

  const save = async () => {
    try {
      const text = editText.trim()
      await onSave(text);
      setAreaText(text);
      setEditText(text);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const edit = () => {
    setEditText(areaText);
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
            <textarea
              value={editText ?? ""}
              onChange={(e) => setEditText(e.target.value)}
            />
            <button onClick={() => save()}>Save</button>
            <button onClick={() => cancel()}>Cancel</button>
          </div>
        ) : (
          <div>
            <Tag>{areaText || <i>{placeholder}</i>}</Tag>
            <button onClick={() => edit()}>Edit</button>
          </div>
        )
      }
    </div>
  )
}
