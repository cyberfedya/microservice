import React from 'react';

const DocumentCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col justify-between p-5 bg-white/5 border border-white/10 rounded-2xl shadow-lg">
      <div className="animate-pulse">
        <div className="flex justify-between items-start">
          <div className="h-6 w-32 bg-slate-700 rounded-full"></div>
          <div className="h-6 w-6 bg-slate-700 rounded-full"></div>
        </div>
        <div className="mt-4 h-6 w-3/4 bg-slate-700 rounded-md"></div>
        <div className="mt-2 space-y-2">
          <div className="h-4 bg-slate-700 rounded-md"></div>
          <div className="h-4 w-5/6 bg-slate-700 rounded-md"></div>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
        <div className="h-5 w-28 bg-slate-700 rounded-md"></div>
        <div className="h-5 w-24 bg-slate-700 rounded-md"></div>
      </div>
    </div>
  );
};

export default DocumentCardSkeleton;