import {twMerge} from 'tailwind-merge';
import React from 'react';
import {ChildrenProp} from "../../types/basic";

type IconCellProps = ChildrenProp & React.HTMLAttributes<HTMLSpanElement>;
const IconCell = ({children, className, ...rest}: IconCellProps) => (
    <span className={twMerge("w-6 h-6 flex items-center justify-center", className)} {...rest}>
    {children}
  </span>
);

export default React.memo(IconCell);