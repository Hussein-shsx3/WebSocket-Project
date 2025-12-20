"use client";

const FormHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  return (
    <div className="w-full flex flex-col items-center gap-2 mb-10">
      <h2 className="text-gray-600">{title}</h2>
      <h6 className="text-gray-500">{subtitle}</h6>
    </div>
  );
};

export default FormHeader;
