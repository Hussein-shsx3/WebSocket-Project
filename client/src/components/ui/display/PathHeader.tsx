const PathHeader = ({PageName}: {PageName: string}) => {
  return (
    <div className="w-full flex items-center justify-between mb-4 border-b border-border border-1 pb-3">
      <h3 className="font-medium text-primary">{PageName}</h3>
    </div>
  );
};

export default PathHeader;
