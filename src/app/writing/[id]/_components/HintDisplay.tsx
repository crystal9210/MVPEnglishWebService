"use client";

const HintDisplay = ({ hint }: { hint: string }) => {
  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-blue-700">
      {hint}
    </div>
  );
};

export default HintDisplay;
