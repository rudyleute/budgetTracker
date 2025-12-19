import { twMerge } from 'tailwind-merge';

const Asterisk = ({title = "Required", className}) => {
  return (
    <span title={title} className={twMerge("text-(--color-third)", className)}>*</span>
  )
}

export default Asterisk