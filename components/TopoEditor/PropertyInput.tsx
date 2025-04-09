type PropertyInputProps = {
  label: string;
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
};

export default function PropertyInput({ label, value, onChange }: PropertyInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="text"
        value={value}
        className="w-full"
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

