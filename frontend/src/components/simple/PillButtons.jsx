import Button from './Button.jsx';
import { twMerge } from 'tailwind-merge';

const PillButtons = ({buttons, className}) => {
  return (
    <div className={twMerge("flex gap-[1px] max-esml:gap-[3px] w-fit rounded-[15px]", className)}>
      {buttons?.map(({content, className: bClassName, ...rest}, ind) => {
        return <Button key={ind} className={twMerge("flex justify-center items-center btn-rounded jump-1 max-sml:!w-[62px] max-sml:!aspect-[16/14]", bClassName)} {...rest}>
          {content}
        </Button>
      })}
    </div>
  )
}

export default PillButtons;