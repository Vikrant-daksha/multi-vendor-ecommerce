import React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={40}
      height={40}
      fill="none"
      {...props}
    >
      <circle cx="50" cy="50" r="45" fill="#3B82F6" />
    </svg>
  );
};

export default Logo;
