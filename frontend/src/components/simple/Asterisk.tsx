import { twMerge } from 'tailwind-merge';
import React from 'react';

interface AsteriskProps {
    title?: string;
    className?: string;
}

const Asterisk = ({title = "Required", className}: AsteriskProps) => {
    return (
        <span title={title} className={twMerge("text-(--color-third)", className)}>*</span>
    )
}

export default Asterisk