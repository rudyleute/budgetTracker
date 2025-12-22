import Button from './Button.jsx';
import { twMerge } from 'tailwind-merge';

const PillButtons = ({ buttons, className, dir = "horizontal" }) => {
  return (
    <div className={twMerge(`flex gap-px max-esml:gap-[3px] w-fit rounded-[15px]`, dir === "vertical" && "flex-col", className)}>
      {buttons?.map(({ content, className: bClassName, ...rest }, ind) => {
        return <Button key={ind}
                       className={twMerge("flex justify-center items-center jump-1 max-sml:w-[62px]! max-sml:aspect-16/14!", dir === "vertical" ? "btn-rounded-vert" : "btn-rounded", bClassName)} {...rest}>
          {content}
        </Button>
      })}
    </div>
  )
}

export default PillButtons;