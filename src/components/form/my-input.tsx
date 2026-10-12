import { MyErrorLabel } from "./my-error-label";

interface MyInputProps {
  label: string;
  error?: string;
  placeholder: string;
  autoFocus?: boolean;
  value: string;
  setValue: (e: string) => void;
}

export const MyInput = ({
  label,
  error,
  placeholder,
  autoFocus = false,
  value = "",
  setValue,
}: MyInputProps) => {
  return (
    <div>
      <label className="field-label">{label}</label>

      <input
        className={`field ${error ? "field-error" : ""}`}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus={autoFocus}
        placeholder={placeholder}
      />

      <MyErrorLabel error={error} />
    </div>
  );
};