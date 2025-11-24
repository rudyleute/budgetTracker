import Button from './Button.jsx';
import { twMerge } from 'tailwind-merge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const IconButton = ({ icon, iconClassName, size, ...rest }) => {
  return (
    <Button type={"button"} {...rest}>
      <FontAwesomeIcon icon={icon} size={size}
                       className={twMerge("text-[var(--color-main)] jump-1", iconClassName)}/>
    </Button>
  )
}

export default IconButton;