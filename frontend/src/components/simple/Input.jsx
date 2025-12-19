import { twMerge } from 'tailwind-merge';

const Input = ({ label, className, lClassName, endAdornment, wClassName, error, ...rest }) => {
  return (
    <div className={twMerge("field-wrapper", wClassName)}>
      {label && <label className={twMerge("label", lClassName)} htmlFor={rest.id}>{label}</label>}
      <div className={"input-wrapper"}>
        <input
          className={twMerge(`field ${endAdornment ? '!pr-[45px]' : '!pr-5'} font-bold`, className)} {...rest} />
        {endAdornment ? <span className={"end-adornment"}>{endAdornment}</span> : null}
      </div>
      {error && <span className={"max-modal:text-xl modal:text-xs text-[var(--color-error)]"}>{error}</span>}
    </div>);
}

export default Input;