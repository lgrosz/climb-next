import { Image as WorldImage } from "@/components/context/TopoWorld";
import ImageProperties from "./ImageProperties";
import { ChangeEvent, useCallback } from "react";
import useImage from "@/hooks/useImage";

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
  const src = availableImages.find(img => img.id === value?.id)?.src;
  const [image] = useImage(src);

  const updateBackground = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;

    if (id) {
      onChange({
        id,
        size: { width: 0, height: 0 },
        position: { x: 0, y: 0 },
      });
    } else {
      onChange(null);
    }
  }, [onChange]);

  const fitToCanvas = useCallback(() => {
    if (!value || !image) return;

    const [width, height] = fitDimensions(fitTo.width, fitTo.height, image.naturalWidth, image.naturalHeight);
    onChange({
      ...value,
      size: { width, height }
    });
  }, [onChange, value, image, fitTo.height, fitTo.width]);

  const useNaturalSize = useCallback(() => {
    if (!value || !image) return;

    const [width, height] = [image.naturalWidth, image.naturalHeight];
    onChange({
      ...value,
      size: { width, height }
    });
  }, [onChange, value, image]);

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
      <div>
        <button disabled={!image?.complete} onClick={fitToCanvas}>Fit to canvas</button>
        <button disabled={!image?.complete} onClick={useNaturalSize}>Use natural size</button>
      </div>
    </div>
  )
}
