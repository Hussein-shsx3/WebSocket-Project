const PathHeader = ({PageName}: {PageName: string}) => {
  return (
    <div className="w-full flex items-center justify-between mb-4 border-b border-border border-1 p-4">
      <h5 className="text-primary">{PageName}</h5>
    </div>
  );
};

export default PathHeader;
