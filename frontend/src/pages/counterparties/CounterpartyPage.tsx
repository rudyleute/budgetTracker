import {useLoans} from '../../context/LoansProvider';
import {useNavigate, useParams} from 'react-router-dom';
import {useState, useEffect, useCallback, useRef} from 'react';
import api from '../../services/axios';
import {formToast} from '../../helpers/toast';
import {toast} from 'react-toastify';
import LoansList from '../../components/loans/LoansList';
import _ from 'lodash';
import CounterpartyFilters from '../../components/counterparties/CounterpartyFilters';
import useLoader from '../../hooks/useLoader';
import {ScaleLoader} from 'react-spinners';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAt, faPhone, faStickyNote} from '@fortawesome/free-solid-svg-icons';
import {twMerge} from 'tailwind-merge';
import IconCell from '../../components/simple/IconCell';
import CounterpartiesForm from '../../components/counterparties/CounterpartiesForm';
import {useModal} from '../../context/ModalProvider';
import {useCounterparties} from '../../context/CounterpartiesProvider';
import {useConfirmation} from '../../context/ConfirmationProvider';
import IconButton from '../../components/simple/IconButton';
import {faCircleXmark} from '@fortawesome/free-regular-svg-icons';
import {onFormSubmit, SubmitWithId} from '../../helpers/utils';
import LinkIcon from '../../components/simple/LinkIcon';
import {FormRef} from "../../types/basic";
import {CounterpartyGetClient} from "../../types/components/mappings";

const CounterpartyPage = () => {
    const {showModal, hideModal} = useModal();
    const {editCounterparty, deleteCounterparty} = useCounterparties();
    const {showConfirmation} = useConfirmation();
    const formRef = useRef<FormRef>(null);
    const [counterparty, setCounterparty] = useState<CounterpartyGetClient>({} as CounterpartyGetClient);
    const {loans, updateLoansQueryParams} = useLoans();
    const {id} = useParams();
    const navigate = useNavigate();
    const {
        hideLoader: hideGetLoader,
        LoaderElem: GetLoader
    } = useLoader({isLoading: true, color: "var(--color-sec)", global: false, LoaderComp: ScaleLoader});

    const onCounterpartyEdit = useCallback(
        async () => onFormSubmit<CounterpartyGetClient>(
            formRef.current?.getData,
            editCounterparty as SubmitWithId<CounterpartyGetClient>,
            (counterparty) => {
                setCounterparty(counterparty);
                hideModal();
            },
            counterparty.id),
        [counterparty.id, editCounterparty, hideModal]
    )

    const handleOnEdit = useCallback(() => {
        showModal({
            title: "Edit counterparty",
            content: <CounterpartiesForm onSubmit={onCounterpartyEdit} data={counterparty} ref={formRef}/>,
            saveFunc: onCounterpartyEdit,
            hideOnSave: false
        })
    }, [counterparty, onCounterpartyEdit, showModal]);

    useEffect(() => {
        (async () => {
            const {data, message} = await api.getById<CounterpartyGetClient>(`/counterparties/${id}`);

            if (!data) {
                toast.error(formToast(message));
                hideGetLoader();
                return;
            }

            setCounterparty(data);
            updateLoansQueryParams({counterparty: id});
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
                                    () => showConfirmation({
                                        onAccept: async () => {
                                            if (await deleteCounterparty(counterparty.id)) navigate(`/counterparties`);
                                        },
                                        text: `the counterparty "${counterparty.name}"`
                                    })} icon={faCircleXmark}
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
                  <LinkIcon title={"Call the number"} to={`tel:+${counterparty.phone}`} color={"var(--color-third)"}
                            icon={faPhone}/>
                </IconCell>
                <span className={"text-clipped grow"}>+{counterparty.phone}</span>
              </span>}
                    {counterparty.email && <span className={"flex items-center gap-[5px]"}>
                <IconCell>
                  <LinkIcon title={"Send an email"} to={`mailto:${counterparty.email}`} color={"var(--color-third)"}
                            icon={faAt}/>
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