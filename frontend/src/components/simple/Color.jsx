import { twMerge } from 'tailwind-merge';

const Color = ({ value, className }) => {
  return (
    <span className={twMerge("inline-block w-[15px] aspect-square rounded-[50%]", className)} style={{ backgroundColor: value }}/>
  )
}

export default Color;