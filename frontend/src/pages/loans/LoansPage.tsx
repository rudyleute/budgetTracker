import PillButtons from '../../components/simple/PillButtons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faArrowDownWideShort,
    faBroom,
    faFileCirclePlus, faMoneyBillTransfer,
    faPause, faPlay,
    faUserGroup
} from '@fortawesome/free-solid-svg-icons';
import Autocomplete from "../../components/simple/Autocomplete";
import IconButton from '../../components/simple/IconButton';
import Select, {SelectOption} from '../../components/simple/Select';
import Input from '../../components/simple/Input';
import {useLoans} from '../../context/LoansProvider';
import React, {useCallback, useMemo, useRef} from 'react';
import {useModal} from '../../context/ModalProvider';
import useAutocomplete from '../../hooks/useAutocomplete';
import LoansForm from '../../components/loans/LoansForm';
import LoansList from '../../components/loans/LoansList';
import {onFormSubmit, SubmitWithoutId} from '../../helpers/utils';
import {FormRef} from "../../types/basic";
import {PagEntityGet} from "../../types/components/mappings";
import {CounterpartiesRequestQuery} from "@app/shared";

const LoansPage = () => {
    const {
        loansQueryParams,
        updateLoansQueryParams,
        resetLoansQueryParams,
        priorities,
        types,
        addLoan
    } = useLoans();
    const formRef = useRef<FormRef>(null);
    const {showModal, hideModal} = useModal();

    const onCounterpartySelect = useCallback(
        (item: PagEntityGet<'counterparty'>) => updateLoansQueryParams({counterparty: item.id}),
        [updateLoansQueryParams]
    );

    const {resetValue, ...restAutocompleteProps} = useAutocomplete<'counterparty', CounterpartiesRequestQuery>({
        optionsEndpoint: "/counterparties",
        onOptionClick: onCounterpartySelect
    });

    const priorityOptions: SelectOption[] = useMemo(
        () => priorities.filter(priority => priority !== loansQueryParams.priority).map((priority, ind) => ({label: priority, id: String(ind)})),
        [loansQueryParams.priority, priorities]
    );
    const typeOptions: SelectOption[] = useMemo(
        () => types.filter(type => type !== loansQueryParams.type).map((type, ind) => ({label: type, id: String(ind)})),
        [loansQueryParams.type, types]
    );

    const onLoanCreate = useCallback(
        async () => onFormSubmit<PagEntityGet<'loan'>>(
            formRef.current?.getData,
            addLoan as SubmitWithoutId<PagEntityGet<'loan'>>,
            hideModal
        ), [addLoan, hideModal]
    )

    const handleCreation = useCallback(() => {
        showModal({
            title: "New loan",
            content: <LoansForm onSubmit={onLoanCreate} ref={formRef}/>,
            saveFunc: onLoanCreate,
            hideOnSave: false
        })
    }, [onLoanCreate, showModal]);

    return (
        <>
            <div
                className={"grid gap-2.5 loans-fil-lrg:grid-cols-[1fr_10fr_10fr_10fr] loans-fil-mid:max-loans-fil-lrg:grid-cols-[1fr_10fr_10fr]" +
                    " max-loans-fil-mid:grid-cols-[1fr_10fr] items-end"}>
                <PillButtons dir={"vertical"}
                             className={"row-span-2 row-start-1 max-loans-fil-mid:row-start-4 col-start-1 h-full"}
                             buttons={[
                                 {
                                     content: <FontAwesomeIcon icon={faFileCirclePlus}/>,
                                     title: "Add a loan",
                                     onClick: handleCreation
                                 },
                                 {
                                     content: <FontAwesomeIcon icon={faBroom}/>,
                                     title: "Reset all filters",
                                     onClick: () => resetLoansQueryParams()
                                 }
                             ]}/>
                <Autocomplete<'counterparty', CounterpartiesRequestQuery>
                    {...restAutocompleteProps}
                    id={"counterparty"}
                    label={<IconButton title={"Reset counterparty"} onClick={() => {
                        resetLoansQueryParams("counterparty")
                        resetValue()
                    }} icon={faUserGroup}/>}
                    className={"field-row col-span-2 h-full"}
                    iClassName={"min-h-full"}
                    lClassName={"!text-black"}
                    placeholder={"Search for counterparty..."}
                />

                <Select
                    className={"field-row max-loans-fil-mid:row-start-2 loans-fil-mid:max-loans-fil-lrg:row-start-3 max-loans-fil-lrg:col-span-2"}
                    lClassName={"!text-black"}
                    label={<IconButton title={"Reset priority"} onClick={() => resetLoansQueryParams(["priority"])}
                                       icon={faArrowDownWideShort}/>}
                    onOptionClick={({label}) => updateLoansQueryParams({priority: label})}
                    options={priorityOptions}
                    value={loansQueryParams.priority || "--Select priority--"}
                />

                <Input
                    label={<IconButton title={"Reset upper date boundary"} onClick={() => resetLoansQueryParams(["to"])}
                                       icon={faPause}/>}
                    lClassName={"!text-black"}
                    wClassName={"field-row loans-fil-mid:max-loans-fil-lrg:row-start-2"}
                    className={"min-h-full"}
                    name={"to"}
                    type={"date"}
                    value={loansQueryParams.to}
                    id={"to"}
                    onChange={(e) => updateLoansQueryParams({to: e.target.value})}
                />

                <Input
                    label={<IconButton title={"Reset lower date boundary"}
                                       onClick={() => resetLoansQueryParams(["from"])}
                                       icon={faPlay}/>}
                    lClassName={"!text-black"}
                    wClassName={"field-row loans-fil-mid:max-loans-fil-lrg:row-start-2"}
                    className={"min-h-full"}
                    name={"from"}
                    type={"date"}
                    id={"for"}
                    value={loansQueryParams.from}
                    onChange={(e) => updateLoansQueryParams({from: e.target.value})}
                />

                <Select
                    lClassName={"!text-black"}
                    className={"field-row max-loans-fil-lrg:row-start-3 max-loans-fil-mid:col-span-2"}
                    label={<IconButton title={"Reset type"} onClick={() => resetLoansQueryParams(["type"])}
                                       icon={faMoneyBillTransfer}/>}
                    onOptionClick={({label}) => updateLoansQueryParams({type: label})}
                    options={typeOptions}
                    value={loansQueryParams.type || "--Select type--"}
                />
            </div>
            <LoansList/>
        </>
    )
}

export default React.memo(LoansPage);