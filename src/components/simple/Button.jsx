import { twMerge } from 'tailwind-merge';

const Button = ({ children, className, onClick, ...rest }) => {
  const handleOnClick = (e) => {
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