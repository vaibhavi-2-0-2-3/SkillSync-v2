import React from 'react';

interface LoadingCardProps {
  className?: string;
}

const LoadingCard: React.FC<LoadingCardProps> = ({ className }) => {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/60 animate-pulse h-32 ${className ?? ''}`}
    />
  );
};

export default LoadingCard;


