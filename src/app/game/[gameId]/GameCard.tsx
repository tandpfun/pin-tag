import React from 'react';

export default function GameCard({
  children,
  className,
  from,
  fromColor,
}: {
  children: React.ReactNode;
  className?: string;
  from?: string;
  fromColor?: string;
}) {
  return (
    <div className={'p-4 sm:p-6 relative ' + className}>
      <div className="text-sm sm:text-lg">{children}</div>
      <div className={'hidden sm:block absolute bottom-1 right-2 ' + fromColor}>
        {from}
      </div>
    </div>
  );
}
