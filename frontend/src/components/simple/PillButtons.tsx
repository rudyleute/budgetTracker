import Button from './Button.jsx';
import { twMerge } from 'tailwind-merge';
import React from "react";

interface PillButtonsProps {
    buttons: (Omit<React.HTMLAttributes<HTMLButtonElement>, 'content'> & {content: React.ReactNode})[];
    color?: string,
    className?: string,
    bClassName?: string,
    dir?: 'horizontal' | 'vertical'
}

const PillButtons = ({ buttons, color, className, bClassName, dir = "horizontal" }: PillButtonsProps) => {
    return (
        <div className={twMerge(`flex gap-px max-esml:gap-[3px] w-fit rounded-[15px]`, dir === "vertical" && "flex-col", className)}>
            {buttons?.map(({ content, className: customBClassName, ...rest }, ind) => {
                return <Button key={ind}
                               className={twMerge("flex justify-center items-center jump-1 max-sml:w-[62px]! max-sml:aspect-16/14!", dir === "vertical" ? "btn-rounded-vert" : "btn-rounded", bClassName, customBClassName, color && `bg-${color}!`)} {...rest}>
                    {content}
                </Button>
            })}
        </div>
    )
}

export default PillButtons;