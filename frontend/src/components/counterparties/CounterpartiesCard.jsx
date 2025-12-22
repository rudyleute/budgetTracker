import React, { useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import { faAt, faCircleUser, faCoins, faPhone, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import CounterpartiesForm from './CounterpartiesForm.jsx';
import { useModal } from '../../context/ModalProvider.jsx';
import { useCounterparties } from '../../context/CounterpartiesProvider.jsx';
import { useRef } from 'react';
import { useConfirmation } from '../../context/ConfirmationProvider.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import IconButton from '../simple/IconButton.jsx';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import IconCell from '../simple/IconCell.jsx';
import { onFormSubmit } from '../../helpers/utils.js';

const CounterpartiesCard = ({ counterparty }) => {
  const { showModal, hideModal } = useModal();
  const { editCounterparty, deleteCounterparty } = useCounterparties();
  const { showConfirmation } = useConfirmation();
  const formRef = useRef(null);
  const navigate = useNavigate();

  const onCounterpartyEdit = useCallback(
    async () => onFormSubmit(formRef.current.getData, editCounterparty, hideModal, counterparty.id),
    [counterparty.id, editCounterparty, hideModal]
  )

  const handleOnEdit = useCallback(() => {
    showModal(
      "Edit counterparty",
      <CounterpartiesForm onSubmit={onCounterpartyEdit} data={counterparty} ref={formRef} isUpdate={true}/>,
      onCounterpartyEdit,
      false
    )
  }, [counterparty, onCounterpartyEdit, showModal]);

  return (
    <div className={"w-full h-fit hover:cursor-pointer sml:lift-scale text-xl"} title={"Edit counterparty"}
         onClick={handleOnEdit}>
      <div
        className={'relative w-full h-full items-center justify-center font-bold grid grid-cols-1 gap-[5px] animate-fade-in text-(--color-text) bg-(--color-main) rounded-[30px] p-[20px_20px]'}
      >
        <span className={"w-full grid grid-cols-3"}>
          <IconCell>
            <IconButton title={`See the loans of ${counterparty.name}`}
                        iconClassName={"icon-xs !text-[var(--color-third)]"}
                        onClick={() => navigate(`/counterparties/${counterparty.id}`)} icon={faCoins}
            />
          </IconCell>
          <FontAwesomeIcon className={"justify-self-center"} size={"3x"} color={"var(--color-third)"} icon={faCircleUser}/>
          <IconCell className={"justify-self-end"}>
            <IconButton title={"Delete counterparty"}
                        iconClassName={"icon-xs !text-[var(--color-third)]"}
                        onClick={
                          () => showConfirmation(
                            () => deleteCounterparty(counterparty.id),
                            `the counterparty "${counterparty.name}"`
                          )} icon={faCircleXmark}
            />
          </IconCell>
        </span>
        <span className={"flex items-center gap-[5px]"}>
          {counterparty.note && <IconCell title={counterparty.note}>
            <FontAwesomeIcon
              color={"var(--color-third)"}
              icon={faStickyNote}
            />
          </IconCell>}
          <span className={"text-clipped grow"}>{counterparty.name}</span>
        </span>
        {counterparty.phone && <span className={"flex items-center gap-[5px]"}>
          <IconCell>
            <Link title={"Call the number"} to={`tel:+${counterparty.phone}`} onClick={(e) => e.stopPropagation()}>
              <FontAwesomeIcon color={"var(--color-third)"} icon={faPhone}/>
            </Link>
          </IconCell>
          <span className={"text-clipped grow"}>+{counterparty.phone}</span>
        </span>}
        {counterparty.email && <span className={"flex items-center gap-[5px]"}>
          <IconCell>
            <Link title={"Send an email"} to={`mailto:${counterparty.email}`} onClick={(e) => e.stopPropagation()}>
              <FontAwesomeIcon color={"var(--color-third)"} icon={faAt}/>
            </Link>
          </IconCell>
          <span className={"text-clipped grow"}>{counterparty.email}</span>
        </span>}
        <span className={twMerge(
          "price-wrapper bg-(--color-pos)/80!",
          counterparty.balance > 0 && "bg-(--color-third)/80!"
        )}>
          {Math.abs(counterparty.balance)} €
        </span>
      </div>
    </div>
  )
}

export default React.memo(CounterpartiesCard);