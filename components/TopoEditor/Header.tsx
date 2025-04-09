import { useTopoEditor } from "../context/TopoEditorContext";

export default function Header() {
  const { title } = useTopoEditor();

  return (
    <div className="p-4 border-b">Topo Editor: {title}</div>
  );
}

