import IconButton from '../simple/IconButton.jsx';
import { getDate } from '../../helpers/transformers.js';
import { twMerge } from 'tailwind-merge';
import { faCircleXmark, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { useConfirmation } from '../../context/ConfirmationProvider.jsx';
import { useTransactions } from '../../context/TransactionsProvider.jsx';
import { useRef } from 'react';
import TransactionsForm from './TransactionsForm.jsx';
import { useModal } from '../../context/ModalProvider.jsx';

const TransactionsItem = ({ data, month }) => {
  const { id, createdAt, name, category, price } = data;
  const { showConfirmation } = useConfirmation();
  const { deleteTransaction, editTransaction } = useTransactions();
  const formRef = useRef(null);
  const { showModal } = useModal();

  const transMonth = getDate(createdAt, { month: "short" });
  const transDay = getDate(createdAt, { day: "2-digit" });

  const handleEditing = () => {
    showModal(
      "New expense",
      <TransactionsForm ref={formRef} name={name} category={category} createdAt={createdAt} price={price} />,
      () => editTransaction(month, id, formRef.current.getData())
    )
  }

  return (
    <div
      className={twMerge("grid grid-cols-[1fr_3fr_18fr_2fr_1fr] text-white font-bold items-center text-xl gap-[10px] pt-[10px] first:pt-[5px] pb-[10px] last:pb-[5px] border-b-2 border-white last:border-b-0")}>
      <div className={"flex flex-col items-center text-white font-bold gap-[10px]"}>
        <span className={"leading-3"}>{transMonth}</span>
        <span className={"text-3xl leading-3"}>{transDay}</span>
      </div>
      <div className={"text-clipped text-hbg"} style={{ color: category.color }}>{category.name}</div>
      <div className={"text-clipped"}>{name}</div>
      <div className={"text-right bg-[#640D5F]/90 text-white font-bold px-3 py-1 rounded-md"}>{price} €</div>
      <div className={"text-center leading-0 flex gap-[3px]"}>
        <IconButton title={"Edit"} iconClassName={"icon-xs !text-[#640D5F]"} onClick={handleEditing}
                    icon={faPenToSquare}/>
        <IconButton title={"Delete"} iconClassName={"icon-xs !text-[#640D5F]"} onClick={
          () => showConfirmation(
            () => deleteTransaction(month, id),
            `transaction: "${name}" on ${transDay} ${transMonth} in category "${category.name}"`
          )} icon={faCircleXmark}/>
      </div>
    </div>
  )
}

export default TransactionsItem;