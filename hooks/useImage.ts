import { useEffect, useState } from "react";

export default function useImage(src?: string) {
  const [el, setEl] = useState<HTMLImageElement>();

  useEffect(() => {
    const image = new Image();

    function onload() {
      setEl(image);
    }

    image.addEventListener("load", onload);

    if (src) {
      image.src = src;
    }

    return () => {
      image.removeEventListener("load", onload);
    }
  }, [src]);

  return [el];
}
