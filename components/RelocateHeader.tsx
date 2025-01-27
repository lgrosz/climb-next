'use client'

import { ElementType, useState } from "react"

interface Coordiante {
  latitude: number,
  longitude: number,
}

interface Props {
  location?: Coordiante | null,
  placeholder?: string,
  as?: ElementType,
  relocate: (_: Coordiante | null) => Promise<void>,
}

export default ({
  location = null,
  placeholder = "",
  as: Tag = "h1",
  relocate,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [headerLatitude, setHeaderLatitude] = useState(location?.latitude || null);
  const [headerLongitude, setHeaderLongitude] = useState(location?.longitude || null);
  const [editLatitude, setEditLatitude] = useState(location?.latitude || null);
  const [editLongitude, setEditLongitude] = useState(location?.longitude || null);

  const save = async () => {
    try {
      let coordinate;

      if (editLatitude === null || editLongitude === null) {
        coordinate = null;
      } else {
        coordinate = {
          latitude: editLatitude,
          longitude: editLongitude,
        }
      }

      await relocate(coordinate);
      setHeaderLatitude(coordinate?.latitude ?? null);
      setHeaderLongitude(coordinate?.longitude ?? null);
      setEditLatitude(coordinate?.latitude ?? null);
      setEditLongitude(coordinate?.longitude ?? null);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const edit = () => {
    setEditLatitude(headerLatitude);
    setEditLongitude(headerLongitude);
    setIsEditing(true);
  }

  const cancel = () => {
    setIsEditing(false);
  }

  const round = (num: number, precision: number) => {
    var base = 10 ** precision;
    return Math.round(num * base) / base;
  }

  const dms = (d: number) => {
    const degrees = Math.floor(d);
    const minutesAndSeconds = (d - degrees) * 60;
    const minutes = Math.floor(minutesAndSeconds);
    const seconds = (minutesAndSeconds - minutes) * 60;
    return `${degrees}° ${minutes}' ${round(seconds, 1).toFixed(1)}"`;
  }

  return (
    <div>
      {
        isEditing ? (
          <div>
            <input
              type="number"
              value={editLatitude ?? ""}
              onChange={(e) => setEditLatitude(parseFloat(e.target.value))}
            />
            <input
              type="number"
              value={editLongitude ?? ""}
              onChange={(e) => setEditLongitude(parseFloat(e.target.value))}
            />
            <button onClick={() => save()}>Save</button>
            <button onClick={() => cancel()}>Cancel</button>
          </div>
        ) : (
          <div>
            <Tag>
              {
                headerLatitude && headerLongitude ?
                  <a href={`geo:${headerLatitude},${headerLongitude}`}>
                    ({dms(headerLatitude)}, {dms(headerLongitude)})
                  </a>
                :
                <i>{placeholder}</i>
              }
            </Tag>
            <button onClick={() => edit()}>Edit</button>
          </div>
        )
      }
    </div>
  )
}
