import { twMerge } from 'tailwind-merge';
import React from 'react';

const IconCell = ({ children, className, ...rest }) => (
  <span className={twMerge("w-6 h-6 flex items-center justify-center", className)} {...rest}>
    {children}
  </span>
);

export default React.memo(IconCell);