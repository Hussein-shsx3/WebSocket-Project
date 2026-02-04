const PathHeader = ({PageName}: {PageName: string}) => {
  return (
    <div className="w-full flex items-center justify-between mb-4 border-b border-border border-1 p-4">
      <h4 className="font-normal text-primary">{PageName}</h4>
    </div>
  );
};

export default PathHeader;
