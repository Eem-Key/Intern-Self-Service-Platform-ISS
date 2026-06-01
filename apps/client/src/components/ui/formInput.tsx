type FormInputProps = {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function FormInput({
  id,
  label,
  type = 'text',
  value,
  error,
  onChange,
}: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-black">
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md bg-[#eeeeee] px-4 text-sm text-black outline-none focus:ring-2 focus:ring-[#ffbd13]"
      />

      {error && (
        <p className="mt-1 text-xs text-[#D32F2F]">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormInput;