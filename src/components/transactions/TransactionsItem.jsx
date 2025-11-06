import IconButton from '../simple/IconButton.jsx';
import { getDate } from '../../helpers/transformers.js';
import { twMerge } from 'tailwind-merge';
import { faCircleXmark, faPenToSquare } from '@fortawesome/free-regular-svg-icons';

const TransactionsItem = ({ data, className }) => {
  const { id, createdAt, createdAtNew, name, category, price } = data;

  return (
    <div className={twMerge("grid grid-cols-[1fr_3fr_18fr_2fr_1fr] text-white font-bold items-center text-xl gap-[10px] pt-[10px] first:pt-[5px] pb-[10px] last:pb-[5px] border-b-2 border-white last:border-b-0")}>
      <div className={"flex flex-col items-center text-white font-bold gap-[10px]"}>
        <span className={"leading-3"}>{getDate(createdAt, {month: "short"})}</span>
        <span className={"text-3xl leading-3"}>{getDate(createdAt, {day: "2-digit"})}</span>
      </div>
      <div className={"text-clipped text-hbg"} style={{color: category.color}}>{category.name}</div>
      <div className={"text-clipped"}>{name}</div>
      <div className={"text-right bg-[#640D5F]/90 text-white font-bold px-3 py-1 rounded-md"}>{price} €</div>
      <div className={"text-center leading-0 flex gap-[3px]"}>
        <IconButton title={"Edit"} iconClassName={"icon-xs !text-[#640D5F]"} onClick={() => alert("Pencil")} icon={faPenToSquare}/>
        <IconButton title={"Delete"} iconClassName={"icon-xs !text-[#640D5F]"} onClick={() => alert("Trash can")} icon={faCircleXmark}/>
      </div>
    </div>
  )
}

export default TransactionsItem;