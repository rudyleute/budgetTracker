import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

const LinkIcon = ({to, title, className, iClassName, icon, color, onClick, ...rest}) => {
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