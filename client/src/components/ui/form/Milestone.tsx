"use client";

const Milestone = ({ title }: { title: string }) => {
  return (
    <div className="flex flex-row items-center justify-center">
      <span className="bg-gray-300 h-[1px] w-[30%]" />
      <div className="text-center text-gray-500 w-[35%] text-sm">{title}</div>
      <span className="bg-gray-300 h-[1px] w-[30%]" />
    </div>
  );
};

export default Milestone;
