import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWineGlassEmpty } from '@fortawesome/free-solid-svg-icons';

const Empty = ({text, size="xl", bgColor="var(--color-sec)", fontColor="var(--color-text)"}) => {
  return <div
    className={"flex rounded-[15px] flex-col gap-[10px] font-bold items-center p-[25px_10px] w-full"}
    style={{backgroundColor: bgColor, color: fontColor}}
  >
    <FontAwesomeIcon size={size} icon={faWineGlassEmpty}/>
    { text }
  </div>
}

export default Empty;