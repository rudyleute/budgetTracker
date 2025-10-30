import classnames from "classnames";

const Input = ({label, name, className, endAdorment, wClassName,  ...rest}) => {
  return (
    <div className={classnames("flex flex-col w-full items-center", wClassName)}>
      {label && <label className={"capitalize font-bold h-fit"} htmlFor={name}>{label}</label>}
      <div className={"w-full relative"}>
        <input className={classnames(`bg-white rounded-[15px] h-[40px] p-[5px] pl-[20px] ${endAdorment ? 'pr-[45px]' : 'pr-[20px]'} w-full font-bold`, className)} {...rest} />
        {endAdorment ? <span className={"absolute right-[10px] !w-[30px] top-[50%] translate-y-[-50%]"}>{endAdorment}</span> : null}
      </div>
    </div>);
}

export default Input;