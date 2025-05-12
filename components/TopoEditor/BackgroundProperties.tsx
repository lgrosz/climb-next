import { Image as WorldImage } from "@/components/context/TopoWorld";
import ImageProperties from "./ImageProperties";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

function fitDimensions(
  width: number,
  height: number,
  thingWidth: number,
  thingHeight: number
): [number, number] {
  if (thingWidth === 0 || thingHeight === 0) {
    return [0, 0];
  }

  const widthRatio = width / thingWidth;
  const heightRatio = height / thingHeight;
  const scale = Math.min(widthRatio, heightRatio);

  const fitWidth = thingWidth * scale;
  const fitHeight = thingHeight * scale;

  return [fitWidth, fitHeight];
}

export default function BackgroundProperties({
  value,
  availableImages,
  fitTo,
  onChange,
}: {
  value?: WorldImage,
  availableImages: { id: string, alt: string, src: string }[],
  fitTo: { width: number, height: number },
  onChange: (change: WorldImage | null) => void,
}) {
  const [imageId, setImageId] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    imageRef.current = new Image;
  }, [])

  const updateBackground = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const data = availableImages.find(i => i.id === id);

    if (id && data?.src && imageRef.current) {
      setImageId(id);
      imageRef.current.src = data.src;
    } else {
      setImageId(null);
      onChange(null);
    }
  }, [availableImages, onChange]);

  useEffect(() => {
    const image = imageRef.current;

    const load = () => {
      if (imageId && image) {
        const [width, height] = fitDimensions(fitTo.width, fitTo.height, image.naturalWidth, image.naturalHeight);

        onChange({
          id: imageId,
          size: { width, height },
        });
      }
    }

    image?.addEventListener("load", load);

    return (() => {
      image?.removeEventListener("load", load);
    });
  }, [imageId, onChange, fitTo.width, fitTo.height]);

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
