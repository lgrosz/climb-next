import { useTopoWorld } from "../context/TopoWorld";

export default function Header() {
  const world = useTopoWorld();

  return (
    <div className="p-4 border-b">Topo Editor: {world.title}</div>
  );
}

