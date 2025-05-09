import { Image } from "@/components/context/TopoWorld";
import ImageProperties from "./ImageProperties";
import { ChangeEvent, useCallback } from "react";

export default function BackgroundProperties({
  value,
  availableImages,
  onChange,
}: {
  value?: Image,
  availableImages: { id: string, alt: string }[],
  onChange: (change: Image | null) => void,
}) {

  const updateBackground = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;

    if (id) {
      onChange({ id });
    } else {
      onChange(null);
    }
  }, [onChange]);

  return (
    <div className="space-y-4">
      <select onChange={updateBackground}>
        <option value="">
          Select an image
        </option>
        {availableImages.map(({ id, alt }) => (
          <option key={id} value={id}>{alt}</option>
        ))}
      </select>
      {value &&
        <ImageProperties image={value} />
      }
    </div>
  )
}
