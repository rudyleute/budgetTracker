import Button from './Button.jsx';
import { twMerge } from 'tailwind-merge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const IconButton = ({ icon, iconClassName, size, ...rest }) => {
  return (
    <Button {...rest}>
      <FontAwesomeIcon icon={icon} size={size}
                       className={twMerge("t-color transition-transform duration-300 hover:scale-110 hover:-translate-y-1", iconClassName)}/>
    </Button>
  )
}

export default IconButton;