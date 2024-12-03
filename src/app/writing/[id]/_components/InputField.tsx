"use client";

const InputField = ({
  index,
  value,
  onChange,
  hint,
  onHintClick
}: {
  index: number;
  value: string;
  onChange: (index: number, value: string) => void;
  hint?: string;
  onHintClick: (hint: string | undefined) => void;
}) => {
  return (
    <span className="inline-flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder="____"
        className="border-b-2 border-gray-400 focus:outline-none focus:border-blue-500 mx-1 w-16 text-center bg-gray-100 text-gray-800"
      />
      {hint && (
        <button
          className="bg-gray-300 text-gray-700 rounded px-2 py-1 text-sm hover:bg-gray-400"
          onClick={() => onHintClick(hint)}
        >
          ?
        </button>
      )}
    </span>
  );
};

export default InputField;
