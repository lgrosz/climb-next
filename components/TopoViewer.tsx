import { TopoWorld, Image, Line } from "./context/TopoWorld";
import { BasisSpline } from "@/lib/BasisSpline";

const splineToPath = (spline: BasisSpline): string => {
  if (spline.points.length === 0) return "";

  const samples = spline.sample(undefined, 200);
  const [firstX, firstY] = samples[0];
  let path = `M ${firstX} ${firstY}`;

  for (let i = 1; i < samples.length; i++) {
    const [x, y] = samples[i];
    path += ` L ${x} ${y}`;
  }

  return path;
};

const TopoImage = ({ image }: { image: Image }) => {
  const { dest, alt, id } = image;
  const width = dest.max.x - dest.min.x;
  const height = dest.max.y - dest.min.y;

  return (
    <image
      href={`/images/${id}/download`}
      x={dest.min.x}
      y={dest.min.y}
      width={width}
      height={height}
      aria-label={alt}
      preserveAspectRatio="xMidYMid slice"
    />
  );
};

const TopoLine = ({ line }: { line: Line }) => {
  const path = splineToPath(
    new BasisSpline(line.geometry.points, line.geometry.degree, line.geometry.knots),
  );

  return (
    <path
      d={path}
      stroke="#ff6b6b"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};

export const TopoViewer = ({
  world,
  className = "",
}: {
  world: TopoWorld;
  className?: string;
}) => {
  const aspectRatio = world.size.width / world.size.height;

  return (
    <div className={`topo-viewer ${className}`}>
      <div
        className="w-full border border-gray-300 rounded-lg overflow-hidden bg-gray-50"
        style={{ aspectRatio: aspectRatio }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${world.size.width} ${world.size.height}`}
          className="block"
        >
          {world.images.map((image) => (
            <TopoImage key={image.featureId} image={image} />
          ))}

          {world.lines.map((line) => (
            <TopoLine key={line.featureId} line={line} />
          ))}
        </svg>
      </div>
    </div>
  );
};

