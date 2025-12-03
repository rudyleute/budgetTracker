import IconButton from '../simple/IconButton.jsx';
import { getDate } from '../../helpers/time.js';
import { twMerge } from 'tailwind-merge';
import { faCircleXmark, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { useConfirmation } from '../../context/ConfirmationProvider.jsx';
import { useTransactions } from '../../context/TransactionsProvider.jsx';
import React, { useRef } from 'react';
import TransactionsForm from './TransactionsForm.jsx';
import { useModal } from '../../context/ModalProvider.jsx';

const TransactionsItem = ({ data }) => {
  const { id, timestamp, name, category, price } = data;
  const { showConfirmation } = useConfirmation();
  const { deleteTransaction, editTransaction } = useTransactions();
  const formRef = useRef(null);
  const { showModal, hideModal } = useModal();

  const transMonth = getDate(timestamp, { month: "short" });
  const transDay = getDate(timestamp, { day: "2-digit" });

  const editTrans = async (id, data) => {
    if (await editTransaction(id, data)) hideModal();
  }

  const onSubmitEdit = async () => {
    const data = await formRef.current.getData();

    if (data) await editTrans(id, data);
  }

  const handleEditing = () => {
    showModal(
      "Edit transaction",
      <TransactionsForm onSubmit={(values) => editTrans(id, values)} ref={formRef} name={name} categoryId={category.id} timestamp={timestamp} price={price} isUpdate={true}/>,
      onSubmitEdit,
      false
    )
  }

  return (
    <div
      className={twMerge("grid mid:grid-cols-[1fr_4fr_23fr_6fr_1fr] max-mid:grid-cols-[1fr_8fr_18fr_10fr_1fr] max-esml:grid-cols-[1fr_4fr_3fr] text-[var(--color-text)] items-center text-xl esml:gap-[10px] max-esml:gap-[5px] items-border animate-fade-in")}>
      <div className={"flex flex-col max-esml:p-[15px_0] max-esml:justify-center max-esml:row-span-3 items-center text-[var(--color-text)] font-bold gap-[10px]"}>
        <span className={"leading-3 max-esml:text-[30px] max-esml:leading-4"}>{transMonth}</span>
        <span className={"text-3xl max-esml:text-[40px] leading-3 max-esml:leading-6"}>{transDay}</span>
      </div>
      <div className="text-clipped text-hbg h-[100%] flex items-center max-esml:row-start-3 max-esml:col-start-2 max-esml:row-span-2">
        <span className="text-clipped" style={{ color: category.color }}>
          {category.name}
        </span>
      </div>
      <div className="text-clipped h-[100%] flex items-center max-esml:pl-[5px] max-esml:pr-[5px] max-esml:bg-[var(--color-third)]/40 max-esml:rounded-[5px] max-esml:row-start-1 max-esml:col-start-2 max-esml:col-span-2 max-esml:row-span-2">
        <span className="text-clipped">
          {name}
        </span>
      </div>
      <div className={"price-wrapper flex items-center justify-end max-esml:row-start-3 max-esml:row-span-2 max-esml:col-start-3 text-[var(--color-text)] px-3 py-1 h-full"}>{price} €</div>
      <div className={"leading-0 flex justify-center max-esml:row-start-4 max-esml:col-start-1 gap-[3px] max-esml:gap-[10px] max-esml:p-[0_5px]"}>
        <IconButton title={"Edit"} iconClassName={"icon-xs max-esml:!text-[var(--color-third)] esml:!text-[var(--color-sec)]"} onClick={handleEditing}
                    icon={faPenToSquare}/>
        <IconButton title={"Delete"} iconClassName={"icon-xs max-esml:!text-[var(--color-third)] esml:!text-[var(--color-sec)]"} onClick={
          () => showConfirmation(
            () => deleteTransaction(id),
            `transaction: "${name}" on ${transDay} ${transMonth} in category "${category.name}"`
          )} icon={faCircleXmark}/>
      </div>
    </div>
  )
}

export default React.memo(TransactionsItem);