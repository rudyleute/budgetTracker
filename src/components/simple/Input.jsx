import classnames from "classnames";

const Input = ({label, name, className, endAdornment, wClassName,  ...rest}) => {
  return (
    <div className={classnames("field-wrapper", wClassName)}>
      {label && <label className={"capitalize font-bold h-fit"} htmlFor={name}>{label}</label>}
      <div className={"w-full relative"}>
        <input className={classnames(`field ${endAdornment ? 'pr-[45px]' : 'pr-[20px]'} font-bold`, className)} {...rest} />
        {endAdornment ? <span className={"end-adornment"}>{endAdornment}</span> : null}
      </div>
    </div>);
}

export default Input;