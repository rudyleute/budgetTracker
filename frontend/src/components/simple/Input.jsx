import { twMerge } from 'tailwind-merge';

const Input = ({ label, name, className, lClassName, endAdornment, wClassName, ...rest }) => {
  return (
    <div className={twMerge("field-wrapper", wClassName)}>
      {label && <label className={twMerge("label", lClassName)} htmlFor={name}>{label}</label>}
      <div className={"w-full relative"}>
        <input
          name={name}
          className={twMerge(`field ${endAdornment ? '!pr-[45px]' : '!pr-[20px]'} font-bold`, className)} {...rest} />
        {endAdornment ? <span className={"end-adornment"}>{endAdornment}</span> : null}
      </div>
    </div>);
}

export default Input;