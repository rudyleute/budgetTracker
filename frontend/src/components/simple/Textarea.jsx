import { twMerge } from 'tailwind-merge';
import Asterisk from './Asterisk.jsx';

const Textarea = ({ label, className, lClassName, required, wClassName, value, error, ...rest }) => {
  return (
    <div className={twMerge("field-wrapper", wClassName)}>
      {label && <label className={twMerge("label", lClassName)} htmlFor={rest.id}>{label}{required && <Asterisk />}</label>}
      <div className={"input-wrapper h-fit!"}>
        <textarea
          className={twMerge(`field pr-5! font-bold s-scroll s-scroll-alt-color`, rest.rows && 'h-auto!', className)} {...rest} >
          {value}
        </textarea>
      </div>
      {error && <span className={"max-modal:text-xl modal:text-xs text-(--color-error)"}>{error}</span>}
    </div>);
}

export default Textarea;