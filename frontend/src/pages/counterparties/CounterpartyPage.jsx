import { useLoans } from '../../context/LoansProvider.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/axios.js';
import { formToast } from '../../helpers/toast.jsx';
import { toast } from 'react-toastify';
import LoansList from '../../components/loans/LoansList.jsx';
import _ from 'lodash';
import CounterpartyFilters from '../../components/counterparties/CounterpartyFilters.jsx';
import useLoader from '../../hooks/useLoader.jsx';
import { ScaleLoader } from 'react-spinners';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAt, faPhone, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import { twMerge } from 'tailwind-merge';
import IconCell from '../../components/simple/IconCell.jsx';
import CounterpartiesForm from '../../components/counterparties/CounterpartiesForm.jsx';
import { useModal } from '../../context/ModalProvider.jsx';
import { useCounterparties } from '../../context/CounterpartiesProvider.jsx';
import { useConfirmation } from '../../context/ConfirmationProvider.jsx';
import IconButton from '../../components/simple/IconButton.jsx';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { onFormSubmit } from '../../helpers/utils.js';
import LinkIcon from '../../components/simple/LinkIcon.jsx';

const CounterpartyPage = () => {
  const { showModal, hideModal } = useModal();
  const { editCounterparty, deleteCounterparty } = useCounterparties();
  const { showConfirmation } = useConfirmation();
  const formRef = useRef(null);
  const [counterparty, setCounterparty] = useState({});
  const { loans, updateLoansQueryParams } = useLoans();
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    hideLoader: hideGetLoader,
    LoaderElem: GetLoader
  } = useLoader({ isLoading: true, color: "var(--color-sec)", global: false, LoaderComp: ScaleLoader });

  const onCounterpartyEdit = useCallback(
    async () => onFormSubmit(formRef.current.getData, editCounterparty, (counterparty) => {
      setCounterparty(counterparty);
      hideModal();
    }, counterparty.id),
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

  useEffect(() => {
    (async () => {
      const { data, message } = await api.get(`/counterparties/${id}`);

      if (message) {
        toast.error(formToast(message));
        hideGetLoader();
        return;
      }

      setCounterparty(data);
      updateLoansQueryParams({ counterparty: id });
      hideGetLoader();
    })();
  }, [loans, hideGetLoader, id, updateLoansQueryParams])

  return (
    <>
    {!_.isEmpty(counterparty) && <>
      <div className={"grid mid:grid-cols-3 cards-sml:max-mid:grid-cols-4"}>
        <div
          onClick={handleOnEdit}
          title={"Edit counterparty"}
          className={"relative cards-sml:col-start-2 max-mid:col-span-2 text-(--color-text) text-xl bg-(--color-sec) rounded-[15px] p-2.5 hover:cursor-pointer sml:lift-scale"}
        >
          <IconCell className={"absolute top-0 right-0 -translate-x-1/5 translate-y-1/3"}>
            <IconButton title={"Delete counterparty"}
                        iconClassName={"icon-xs !text-(--color-third)"}
                        onClick={
                          () => showConfirmation(
                            () => {
                              if (deleteCounterparty(counterparty.id)) navigate(`/counterparties`);
                            },
                            `the counterparty "${counterparty.name}"`
                          )} icon={faCircleXmark}
            />
          </IconCell>
          <span className={"flex items-center gap-[5px] text-2xl"}>
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
            "price-wrapper bg-(--color-pos)!",
            counterparty.balance > 0 && "bg-(--color-third)!"
          )}>
            {Math.abs(counterparty.balance)} €
          </span>
        </div>
      </div>
      <CounterpartyFilters counterparty={counterparty}/>
    </>}

    <GetLoader>
      {!_.isEmpty(counterparty) && <LoansList/>}
    </GetLoader>
</>
)
}

export default CounterpartyPage;