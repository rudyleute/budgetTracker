import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWineGlassEmpty } from '@fortawesome/free-solid-svg-icons';
import { twMerge } from 'tailwind-merge';

const Empty = ({className, text, size="xl", bgColor="var(--color-sec)", fontColor="var(--color-text)"}) => {
  return <div
    className={twMerge("flex rounded-[15px] flex-col gap-2.5 font-bold items-center p-[25px_10px] w-full", className)}
    style={{backgroundColor: bgColor, color: fontColor}}
  >
    <FontAwesomeIcon size={size} icon={faWineGlassEmpty}/>
    { text }
  </div>
}

export default Empty;