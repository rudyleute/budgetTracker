import React, {useCallback, useMemo} from 'react';
import {twMerge} from 'tailwind-merge';
import {DateInput, daysUntilDateOnly, formatTimestamp} from '../../helpers/time.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCircleCheck, faClock, faFlag, faVault, faWallet} from '@fortawesome/free-solid-svg-icons';
import {priorityColorMap} from '../../helpers/variables.js';
import LoansForm from './LoansForm';
import {useModal} from '../../context/ModalProvider';
import {useLoans} from '../../context/LoansProvider';
import {useRef} from 'react';
import IconButton from '../simple/IconButton';
import {faCircleXmark} from '@fortawesome/free-regular-svg-icons';
import {useConfirmation} from '../../context/ConfirmationProvider';
import IconCell from '../simple/IconCell';
import {onFormSubmit, SubmitWithId} from '../../helpers/utils.js';
import {PagEntityGet} from "../../types/components/mappings";
import {FormRef} from "../../types/basic";

interface LoansCardProps {
    loan: PagEntityGet<'loan'>,
    onAfterEdit?: (loan: PagEntityGet<'loan'>) => unknown,
    onAfterDeleteSuccess?: () => unknown
}

const LoansCard = ({loan, onAfterEdit, onAfterDeleteSuccess}: LoansCardProps) => {
    const {showModal, hideModal} = useModal();
    const {editLoan, deleteLoan, closeLoan} = useLoans();
    const {showConfirmation} = useConfirmation();
    const formRef = useRef<FormRef>(null);
    const isActive = useMemo(() => !loan.closedAt, [loan.closedAt])

    const getTimestamp = useCallback(
        (timestamp: DateInput) => formatTimestamp(timestamp, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }), []);

    const timestamp = useMemo(() => formatTimestamp(loan.timestamp), [loan.timestamp])

    const onLoanEdit = useCallback(
        async () => onFormSubmit<PagEntityGet<'loan'>>(
            formRef.current?.getData,
            editLoan as SubmitWithId<PagEntityGet<'loan'>>,
            (loan) => {
                hideModal();
                onAfterEdit && onAfterEdit(loan);
            },
            loan.id
        ), [editLoan, hideModal, loan.id, onAfterEdit])

    const handleOnEdit = useCallback(() => {
        showModal({
            title: "Edit loan",
            content: <LoansForm onSubmit={onLoanEdit} data={loan} ref={formRef} isUpdate={true}/>,
            saveFunc: onLoanEdit,
            hideOnSave: false
        })
    }, [loan, onLoanEdit, showModal]);

    return (
        <div className={"w-full h-fit hover:cursor-pointer sml:lift-scale"} title={"Edit loan"} onClick={handleOnEdit}>
            <div
                className={twMerge('relative w-full h-full items-center font-bold grid grid-cols-[1fr_10fr_1fr] animate-fade-in text-(--color-text) bg-(--color-main) rounded-[30px] p-[20px_10px] max-cards-sml:p-[30px_30px]', isActive && loan.isDue && 'due', !isActive && `bg-(--color-main)/60`)}>
                {isActive &&
                  <IconButton className={"absolute top-0 left-0 translate-x-1/5 translate-y-1/3"}
                              title={"Mark as closed"}
                              iconClassName={"icon-xs !text-(--color-third)"}
                              onClick={() => closeLoan(loan.id)} icon={faCircleCheck}
                  />}
                <span className={"text-clipped text-xs inline-flex justify-center items-center col-span-full mb-[5px]"}>
          <FontAwesomeIcon size={"xs"} icon={faClock}/>
                    {timestamp.slice(0, timestamp.length - 3)}
        </span>
                <IconButton className={"absolute top-0 right-0 -translate-x-1/5 translate-y-1/3"} title={"Delete loan"}
                            iconClassName={"icon-xs !text-(--color-third)"}
                            onClick={
                                () => showConfirmation({
                                    onAccept: async () => {
                                        if (await deleteLoan(loan.id) && onAfterDeleteSuccess) onAfterDeleteSuccess();
                                    },
                                    text: `the loan "${loan.name}" on ${timestamp.slice(0, timestamp.length - 3)} that belongs to the counterparty "${loan.counterparty.name}"`
                                })} icon={faCircleXmark}
                />

                <IconCell title={loan.type}>
                    <FontAwesomeIcon size={"xs"} icon={loan.type === "borrowed" ? faVault : faWallet}/>
                </IconCell>
                {
                    (isActive ? //if the loan is active, check the deadline
                            (
                                loan.deadline ? (() => {
                                    const days = daysUntilDateOnly(loan.deadline);
                                    const color = days <= 0 ? 'red' : 'green';

                                    return (
                                        <span
                                            className={twMerge("font-b text-clipped h-full justify-self-center text-(--color-pos)!", days <= 0 && "text-(--color-third)!")}
                                            title={getTimestamp(loan.deadline)} style={{color}}>
                                     {Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''}
                                   </span>
                                    );
                                })() : <span/>
                            ) :
                            ( //if the loan is not active, show the closing date
                                <span className={"text-xl text-clipped h-full justify-self-center"}>
                                    <FontAwesomeIcon size={"xs"} icon={faCircleCheck}/>
                                    {formatTimestamp(loan.closedAt!).slice(0, timestamp.length - 3)}
                                </span>
                            )
                    )
                }
                {
                    loan.priority ? <IconCell title={`${loan.priority} priority`}>
                        <FontAwesomeIcon size={"xs"} icon={faFlag} style={{color: priorityColorMap[loan.priority]}}/>
                    </IconCell> : <IconCell/>
                }
                <span className={"col-span-full price-wrapper justify-center!"}>{loan.counterparty.name}</span>
                <span className={"text-clipped col-span-full justify-self-center"}>{loan.name}</span>
                <span
                    className={twMerge("price-wrapper col-span-full p-[0_10px] bg-(--color-third)/80!", loan.type === "lent" && "bg-(--color-pos)/80!")}>{loan.sum} €</span>
            </div>
        </div>
    )
}

export default React.memo(LoansCard);