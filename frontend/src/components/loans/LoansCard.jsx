import React, { useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { daysUntilDateOnly, formatTimestamp } from '../../helpers/time.js';
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
import _ from 'lodash';
import IconCell from '../simple/IconCell.jsx';

const LoansCard = ({ loan, onAfterEdit, onAfterDeleteSuccess }) => {
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

  const onSubmitEdit = useCallback(async () => {
    const fields = await formRef.current.getData();

    if (_.isEmpty(fields)) return null;

    const res = await editLoan(loan.id, fields);
    if (res) {
      hideModal();
      onAfterEdit && onAfterEdit(res);
    }

    return null;
  }, [editLoan, hideModal, loan.id, onAfterEdit]);

  const handleOnEdit = useCallback(() => {
    showModal(
      "Edit loan",
      <LoansForm onSubmit={onSubmitEdit} data={loan} ref={formRef} isUpdate={true}/>,
      onSubmitEdit,
      false
    )
  }, [loan, onSubmitEdit, showModal]);

  return (
    <div className={"w-full h-fit hover:cursor-pointer sml:lift-scale"} title={"Edit loan"} onClick={handleOnEdit}>
      <div
        className={twMerge('relative w-full h-full items-center font-bold grid grid-cols-[1fr_10fr_1fr] animate-fade-in text-[var(--color-text)] bg-[var(--color-main)] rounded-[30px] p-[20px_10px] max-cards-sml:p-[30px_30px]', `${loan.isDue && 'due'}`)}>
        <span className={"text-clipped text-xs inline-flex justify-center items-center col-span-full mb-[5px]"}>
          <FontAwesomeIcon size={"xs"} icon={faClock}/>
          {timestamp.slice(0, timestamp.length - 3)}
        </span>
        <IconButton className={"absolute top-0 right-0 -translate-x-1/5 translate-y-1/3"} title={"Delete loan"} iconClassName={"icon-xs !text-[var(--color-third)]"}
                    onClick={
                      () => showConfirmation(
                        () => {
                          if (deleteLoan(loan.id) && onAfterDeleteSuccess) onAfterDeleteSuccess();
                        },
                        `the loan "${loan.name}" on ${timestamp.slice(0, timestamp.length - 3)} that belongs to the counterparty "${loan.counterparty.name}"`
                      )} icon={faCircleXmark}
        />

        <IconCell title={loan.type}>
          <FontAwesomeIcon size={"xs"} icon={loan.type === "borrowed" ? faVault : faWallet}/>
        </IconCell>
        {
          loan.deadline ? (() => {
            const days = daysUntilDateOnly(loan.deadline);
            const color = days <= 0 ? 'red' : 'green';

            return (
              <span className={twMerge("font-b text-clipped h-full justify-self-center !text-[var(--color-pos)]", days <= 0 && "!text-[var(--color-third)]")}
                    title={getTimestamp(loan.deadline)} style={{ color }}>
              {Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''}
          </span>
            );
          })() : <span/>
        }
        {
          loan.priority ? <IconCell title={`${loan.priority} priority`}>
            <FontAwesomeIcon size={"xs"} icon={faFlag} style={{ color: priorityColorMap[loan.priority] }}/>
          </IconCell> : <IconCell/>
        }
        <span className={"col-span-full price-wrapper !justify-center"}>{loan.counterparty.name}</span>
        <span className={"text-clipped col-span-full justify-self-center"}>{loan.name}</span>
        <span className={twMerge("price-wrapper col-span-full p-[0_10px] !bg-[var(--color-third)]/80", loan.type === "lent" && "!bg-[var(--color-pos)]/80")}>{loan.sum} €</span>
      </div>
    </div>
  )
}

export default React.memo(LoansCard);