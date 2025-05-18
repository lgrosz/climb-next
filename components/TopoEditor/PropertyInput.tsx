import { HTMLInputTypeAttribute } from "react";

type PropertyInputProps = {
  label: string;
  value: string;
  type: HTMLInputTypeAttribute;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default function PropertyInput({ label, type, value, onChange }: PropertyInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        className="w-full"
        onChange={onChange}
      />
    </div>
  );
}

