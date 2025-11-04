import Button from './Button.jsx';
import { twMerge } from 'tailwind-merge';

const PillButtons = ({buttons, className}) => {
  return (
    <div className={twMerge("flex gap-[1px] w-fit rounded-[15px]", className)}>
      {buttons.map(({content, className: bClassName, ...rest}, ind) => {
        return <Button key={ind} className={twMerge("btn-rounded jump-1", bClassName)} {...rest}>
          {content}
        </Button>
      })}
    </div>
  )
}

export default PillButtons;