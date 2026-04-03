import { twMerge } from 'tailwind-merge';
import React from "react";

interface ColorProps {
    value: string;
    className?: React.HTMLAttributes<HTMLSpanElement>["className"];
}
const Color = ({ value, className }: ColorProps) => {
    return (
        <span className={twMerge("inline-block w-[15px] aspect-square rounded-[50%]", className)} style={{ backgroundColor: value }}/>
    )
}

export default Color;