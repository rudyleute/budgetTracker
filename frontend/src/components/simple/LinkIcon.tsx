import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {Link, LinkProps} from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import React from "react";

export interface LinkIconProps extends LinkProps {
    iClassName?: string;
    icon: IconProp;
    color?: string;
}
const LinkIcon = ({to, title, className, iClassName, icon, color, onClick, ...rest}: LinkIconProps) => {
    return (
        <Link onClick={(e) => {
            e.stopPropagation();
            onClick && onClick(e);
        }} to={to} title={title} className={twMerge("jump-1", className)} {...rest}>
            <FontAwesomeIcon icon={icon} color={color} className={iClassName} />
        </Link>
    )
}

export default LinkIcon;