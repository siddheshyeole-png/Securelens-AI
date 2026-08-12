import React from "react";

export const Skeleton = ({ className = "", width, height }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`}
      style={{ width, height }}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="p-6 rounded-[20px] bg-white border border-slate-200 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="w-3/4 h-6 rounded-lg" />
      <Skeleton className="w-full h-4 rounded-md" />
      <Skeleton className="w-2/3 h-4 rounded-md" />
    </div>
  );
};
