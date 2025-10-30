import Button from './Button.jsx';
import classnames from "classnames";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const IconButton = ({icon, iconClassName, ...rest}) => {
  return (
    <Button {...rest}>
      <FontAwesomeIcon icon={icon} className={classnames("t-color transition-transform duration-300 hover:scale-110 hover:-translate-y-1", iconClassName)} />
    </Button>
  )
}

export default IconButton;