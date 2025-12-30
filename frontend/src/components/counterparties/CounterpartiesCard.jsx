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
import IconCell from '../simple/IconCell.jsx';
import { onFormSubmit } from '../../helpers/utils.js';
import LinkIcon from '../simple/LinkIcon.jsx';

const CounterpartiesCard = ({ counterparty }) => {
  const { showModal, hideModal } = useModal();
  const { editCounterparty, deleteCounterparty } = useCounterparties();
  const { showConfirmation } = useConfirmation();
  const formRef = useRef(null);

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
            <LinkIcon to={`/counterparties/${counterparty.id}`} title={`See the loans of ${counterparty.name}`}
                      icon={faCoins} iClassName={"icon-xs text-(--color-third)!"}
            />
          </IconCell>
          <FontAwesomeIcon className={"justify-self-center"} size={"3x"} color={"var(--color-third)"} icon={faCircleUser}/>
          <IconCell className={"justify-self-end"}>
            <IconButton title={"Delete counterparty"}
                        iconClassName={"icon-xs !text-(--color-third)"}
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
            <LinkIcon title={"Call the number"} to={`tel:+${counterparty.phone}`} color={"var(--color-third)"} icon={faPhone}/>
          </IconCell>
          <span className={"text-clipped grow"}>+{counterparty.phone}</span>
        </span>}
        {counterparty.email && <span className={"flex items-center gap-[5px]"}>
          <IconCell>
            <LinkIcon title={"Send an email"} to={`mailto:${counterparty.email}`} color={"var(--color-third)"} icon={faAt}/>
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