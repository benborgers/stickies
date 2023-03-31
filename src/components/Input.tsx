export default function ({
  label,
  ...props
}: { label: string } & JSX.IntrinsicElements["input"]) {
  const id = `input-${label.toLowerCase().replace(/ /g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="block text-gray-400 text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        className="mt-0.5 rounded-lg w-full border-gray-300 bg-gray-50 transition-colors focus:border-gray-800 focus:ring-gray-800"
        {...props}
      />
    </div>
  );
}
