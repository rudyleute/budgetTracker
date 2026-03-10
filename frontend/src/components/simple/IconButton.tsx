import Button, {ButtonProps} from './Button.jsx';
import { twMerge } from 'tailwind-merge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core';
import React from "react";

interface IconButtonProps extends Omit<ButtonProps, 'children'> {
    icon: IconProp;
    iconClassName?: string;
    size?: SizeProp;
}
const IconButton = ({ icon, iconClassName, size, ...rest }: IconButtonProps) => {
    return (
        <Button type={"button"} {...rest}>
            <FontAwesomeIcon icon={icon} size={size}
                             className={twMerge("text-(--color-main) jump-1", iconClassName)}/>
        </Button>
    )
}

export default IconButton;