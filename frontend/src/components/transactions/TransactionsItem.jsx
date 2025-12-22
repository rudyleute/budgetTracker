import IconButton from '../simple/IconButton.jsx';
import { getDate } from '../../helpers/time.js';
import { twMerge } from 'tailwind-merge';
import { faCircleXmark, faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { useConfirmation } from '../../context/ConfirmationProvider.jsx';
import { useTransactions } from '../../context/TransactionsProvider.jsx';
import React, { useCallback, useRef } from 'react';
import TransactionsForm from './TransactionsForm.jsx';
import { useModal } from '../../context/ModalProvider.jsx';
import { onFormSubmit } from '../../helpers/utils.js';

const TransactionsItem = ({ data }) => {
  const { id, timestamp, name, category, price } = data;
  const { showConfirmation } = useConfirmation();
  const { deleteTransaction, editTransaction } = useTransactions();
  const formRef = useRef(null);
  const { showModal, hideModal } = useModal();

  const transMonth = getDate(timestamp, { month: "short" });
  const transDay = getDate(timestamp, { day: "2-digit" });

  const onTransactionEdit = useCallback(
    async () => onFormSubmit(formRef.current.getData, editTransaction, hideModal, id),
    [editTransaction, hideModal, id]
  )

  const handleEditing = useCallback(() => {
    showModal(
      "Edit transaction",
      <TransactionsForm onSubmit={onTransactionEdit} ref={formRef} name={name} categoryId={category.id} timestamp={timestamp} price={price} isUpdate={true}/>,
      onTransactionEdit,
      false
    )
  }, [category.id, name, onTransactionEdit, price, showModal, timestamp])

  return (
    <div
      className={twMerge("grid mid:grid-cols-[1fr_4fr_23fr_6fr_1fr] max-mid:grid-cols-[1fr_8fr_18fr_10fr_1fr] max-esml:grid-cols-[1fr_4fr_3fr] text-(--color-text) items-center text-xl esml:gap-2.5 max-esml:gap-[5px] items-border animate-fade-in")}>
      <div className={"flex flex-col max-esml:p-[15px_0] max-esml:justify-center max-esml:row-span-3 items-center text-(--color-text) font-bold gap-2.5"}>
        <span className={"leading-3 max-esml:text-[30px] max-esml:leading-4"}>{transMonth}</span>
        <span className={"text-3xl max-esml:icon-s leading-3 max-esml:leading-6"}>{transDay}</span>
      </div>
      <div className="text-clipped text-hbg h-full flex items-center max-esml:row-start-3 max-esml:col-start-2 max-esml:row-span-2">
        <span className="text-clipped" style={{ color: category.color }}>
          {category.name}
        </span>
      </div>
      <div className="text-clipped h-full flex items-center max-esml:pl-[5px] max-esml:pr-[5px] max-esml:bg-(--color-third)/40 max-esml:rounded-[5px] max-esml:row-start-1 max-esml:col-start-2 max-esml:col-span-2 max-esml:row-span-2">
        <span className="text-clipped">
          {name}
        </span>
      </div>
      <div className={"price-wrapper flex items-center justify-end max-esml:row-start-3 max-esml:row-span-2 max-esml:col-start-3 text-(--color-text) px-3 py-1 h-full"}>{price} €</div>
      <div className={"leading-0 flex justify-center max-esml:row-start-4 max-esml:col-start-1 gap-[3px] max-esml:gap-2.5 max-esml:p-[0_5px]"}>
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