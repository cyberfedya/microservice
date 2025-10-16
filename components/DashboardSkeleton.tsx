import React from 'react';
import DocumentCardSkeleton from './DocumentCardSkeleton';

const DashboardSkeleton: React.FC<{ count?: number }> = ({ count = 9 }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, index) => (
        <DocumentCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default DashboardSkeleton;