import React, { useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { daysUntilDateOnly, formatTimestamp } from '../../helpers/time.js';
import Button from '../simple/Button.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faFlag, faVault, faWallet } from '@fortawesome/free-solid-svg-icons';
import { priorityColorMap } from '../../helpers/variables.js';
import LoansForm from './LoansForm.jsx';
import { useModal } from '../../context/ModalProvider.jsx';
import { useLoans } from '../../context/LoansProvider.jsx';
import { useRef } from 'react';
import IconButton from '../simple/IconButton.jsx';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { useConfirmation } from '../../context/ConfirmationProvider.jsx';

const LoansCard = ({ loan }) => {
  const { showModal, hideModal } = useModal();
  const { editLoan, deleteLoan } = useLoans();
  const { showConfirmation } = useConfirmation();
  const formRef = useRef(null);

  const getTimestamp = useCallback(
    (timestamp) => formatTimestamp(timestamp, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    []);

  const timestamp = useMemo(() => formatTimestamp(loan.timestamp), [loan.timestamp])

  const deadline = loan.deadline ? (() => {
    const days = daysUntilDateOnly(loan.deadline);
    const color = days < 0 ? 'red' : 'green';

    return (
      <span className={"font-b text-clipped"}
            title={getTimestamp(loan.deadline)} style={{ color }}>
                {Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''}
            </span>
    );
  })() : <span/>;

  const editLoanWithHide = useCallback(async (data) => {
    if (await editLoan(loan.id, data)) hideModal();
  }, [editLoan, hideModal, loan.id])

  const onSubmitEdit = useCallback(async () => {
    const fields = await formRef.current.getData();
    if (fields) await editLoanWithHide(fields);
  }, [editLoanWithHide]);

  const handleOnEdit = useCallback(() => {
    showModal(
      "Edit loan",
      <LoansForm onSubmit={editLoanWithHide} data={loan} ref={formRef} isUpdate={true}/>,
      onSubmitEdit,
      false
    )
  }, [editLoanWithHide, loan, onSubmitEdit, showModal]);

  return (
    <Button className={"w-full h-fit sml:lift-scale"} title={"Edit loan"} onClick={handleOnEdit}>
      <div
        className={twMerge('w-full h-full font-bold grid grid-cols-[1fr_10fr_1fr] animate-fade-in text-[var(--color-text)] bg-[var(--color-main)] rounded-[30px] p-[20px_10px] max-cards-sml:p-[30px_30px]', `${loan.isDue && 'due'}`)}>
        <>
          <span className={"text-clipped text-xs inline-flex justify-center items-center col-start-2"}>
            <FontAwesomeIcon size={"xs"} icon={faClock}/>
            {timestamp.slice(0, timestamp.length - 3)}
          </span>
          <IconButton title={"Delete loan"} iconClassName={"icon-xs !text-[var(--color-third)] justify-self-end"}
                      onClick={
                        () => showConfirmation(
                          () => deleteLoan(loan.id),
                          `loan: "${loan.name}" on ${timestamp.slice(0, timestamp.length - 3)} of counterparty "${loan.counterparty.name}"`
                        )} icon={faCircleXmark}
          />

          <span title={loan.type}>
            <FontAwesomeIcon size={"xs"} icon={loan.type === "borrowed" ? faVault : faWallet}/>
          </span>
          {deadline}
          {
            loan.priority ? <span title={`${loan.priority} priority`}>
              <FontAwesomeIcon size={"xs"} icon={faFlag} style={{ color: priorityColorMap[loan.priority] }}/>
            </span> : <span/>
          }
          <span className={"col-span-full price-wrapper !text-center"}>{loan.counterparty.name}</span>
          <span className={"text-clipped col-span-full"}>{loan.name}</span>
          <span className={"price-wrapper col-span-full p-[0_10px] !bg-[var(--color-third)]/80"}>{loan.sum} €</span>
        </>
      </div>
    </Button>
  )
}

export default React.memo(LoansCard);