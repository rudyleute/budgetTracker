import classNames from "classnames";

const Button = ({ children, className, ...rest }) => {
  return (
    <button className={classNames('hover:cursor-pointer w-fit h-fit', className)} {...rest}>
      {children}
    </button>
  )
}

export default Button;