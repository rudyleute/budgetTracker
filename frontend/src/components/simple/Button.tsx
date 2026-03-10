import { twMerge } from 'tailwind-merge';
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

const Button = ({ children, className, onClick, ...rest }: ButtonProps) => {
    const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onClick && onClick(e);
    }
    return (
        <button className={twMerge('hover:cursor-pointer w-fit h-fit', className)} onClick={handleOnClick} {...rest}>
            {children}
        </button>
    )
}

export default Button;