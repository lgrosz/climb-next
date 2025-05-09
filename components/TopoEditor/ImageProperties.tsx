import { Image } from "@/components/context/TopoWorld";
import { useTopoSession } from "../context/TopoSession";

export default function ImageProperties({
  image,
}: {
  image: Image,
}) {
  const { availableImages } = useTopoSession();
  const sessionImage = availableImages.find((img) => img.id === image.id);

  return (
    <div className="flex flex-col gap-2">
      <img
        className="max-h-32 object-contain"
        src={sessionImage?.src}
        alt={sessionImage?.alt}
      />
    </div>
  );
}
