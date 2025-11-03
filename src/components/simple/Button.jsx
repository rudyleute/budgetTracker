import { twMerge } from 'tailwind-merge';

const Button = ({ children, className, ...rest }) => {
  return (
    <button className={twMerge('hover:cursor-pointer w-fit h-fit', className)} {...rest}>
      {children}
    </button>
  )
}

export default Button;