import { ChangeEvent, useCallback } from "react";
import PropertyInput from "./PropertyInput";

interface Size {
  width: number;
  height: number;
};

export default function CanvasProperties(
  {
    value,
    onChange
  }: {
    value: Size,
    onChange: (size: Size) => void,
  }
) {
  const onWidthChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value);

    if (isNaN(width)) {
      return;
    }

    onChange({ ...value, width });
  }, [value, onChange]);

  const onHeightChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const height = parseInt(e.target.value);

    if (isNaN(height)) {
      return;
    }

    onChange({ ...value, height });
  }, [value, onChange]);

  return (
    <div>
      <PropertyInput
        type="number"
        label="Width"
        value={value.width.toString()}
        onChange={onWidthChanged}
      />
      <PropertyInput
        type="number"
        label="Height"
        value={value.height.toString()}
        onChange={onHeightChanged}
      />
    </div>
  );
}
