type PropertyInputProps = {
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default function PropertyInput({ label, value, onChange }: PropertyInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="text"
        value={value}
        className="w-full"
        onChange={onChange}
      />
    </div>
  );
}

