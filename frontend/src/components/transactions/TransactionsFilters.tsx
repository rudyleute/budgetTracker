import Input from '../simple/Input';
import IconButton from '../simple/IconButton';
import {
    faBroom,
    faBusinessTime,
    faCartPlus,
    faMagnifyingGlass,
    faPause,
    faPlay
} from '@fortawesome/free-solid-svg-icons';
import Select, {SelectOption} from '../simple/Select';
import PillButtons from '../simple/PillButtons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {ChangeEvent, useCallback, useMemo, useRef, useState} from 'react';
import {useTransactions} from '../../context/TransactionsProvider';
import {useModal} from '../../context/ModalProvider';
import _ from 'lodash';
import {createTimeFilters} from '../../helpers/time';
import TransactionsForm from './TransactionsForm';
import {onFormSubmit, SubmitWithoutId} from '../../helpers/utils';
import {TransactionsRequestQuery} from "@app/shared";
import {FormRef} from "../../types/basic";
import {PagEntityGet} from "../../types/components/mappings";

const defaultOption = {label: "---Select the period---", id: "-1"}
const TransactionsFilters = () => {
    const [option, setOption] = useState<SelectOption>(defaultOption);
    const [searchValue, setSearchValue] = useState("");
    const {addTransaction, queryTransParams, updateTransQueryParams, resetTransQueryParams} = useTransactions();
    const {showModal, hideModal} = useModal();
    const formRef = useRef<FormRef>(null);

    const debouncedSearch = useCallback(
        _.debounce((value) => {
            updateTransQueryParams({filter: value})
        }, 500),
        [updateTransQueryParams]
    );

    const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        debouncedSearch(value);
    }, [debouncedSearch])

    const setValues = useCallback((from: TransactionsRequestQuery["from"], to: TransactionsRequestQuery["to"]) => {
        updateTransQueryParams({from, to});
    }, [updateTransQueryParams]);

    const options = useMemo(() => createTimeFilters(setValues), [setValues]);

    const onTransactionCreate = useCallback(
        async () => onFormSubmit<PagEntityGet<'transaction'>>(
            formRef.current?.getData,
            addTransaction as SubmitWithoutId<PagEntityGet<'transaction'>>,
            hideModal
        ), [addTransaction, hideModal]
    );

    const handleCreation = useCallback(() => {
        showModal({
            title: "New transaction",
            content: <TransactionsForm onSubmit={onTransactionCreate} ref={formRef}/>,
            saveFunc: onTransactionCreate,
            hideOnSave: false
        })
    }, [onTransactionCreate, showModal])

    return (
        <div className={"grid filters-4-grid gap-2.5 animate-fade-in"}>
            <Input
                label={<IconButton title={"Reset name filter"} onClick={() => {
                    resetTransQueryParams("filter")
                    setSearchValue("")
                }} icon={faMagnifyingGlass}/>}
                lClassName={"!text-black"}
                wClassName={"field-row filters-4-1"}
                placeholder={"Search by name..."}
                type={"text"}
                value={searchValue}
                id={"filter"}
                onChange={handleSearchChange}
            />

            <Select
                className={"field-row filters-4-3"}
                lClassName={"!text-black"}
                value={option.label}
                onOptionClick={(option) => setOption(option)}
                options={options.filter(opt => opt.label !== option?.label)}
                label={<IconButton title={"Reset the period"} onClick={() => {
                    setOption(prev => prev.label === defaultOption.label ? prev : defaultOption);
                }} icon={faBusinessTime}/>}
            />

            <Input
                label={<IconButton title={"Reset to-date"} onClick={() => {
                    resetTransQueryParams("to")
                }} icon={faPause}/>}
                lClassName={"!text-black"}
                wClassName={"field-row filters-4-2"}
                name={"to"}
                type={"date"}
                value={queryTransParams.to}
                id={"to"}
                onChange={(e) => {
                    updateTransQueryParams({to: e.target.value})
                    setOption(prev => prev.label === defaultOption.label ? prev : defaultOption);
                }}
            />

            <Input
                label={<IconButton title={"Reset from-date"} onClick={() => {
                    resetTransQueryParams("from")
                }} icon={faPlay}/>}
                lClassName={"!text-black"}
                wClassName={"field-row filters-4-4"}
                name={"from"}
                type={"date"}
                id={"for"}
                value={queryTransParams.from}
                onChange={(e) => {
                    updateTransQueryParams({from: e.target.value})
                    setOption(prev => prev.label === defaultOption.label ? prev : defaultOption);
                }}
            />

            <PillButtons
                className={"filters-4-btns"}
                buttons={[
                    {content: <FontAwesomeIcon icon={faCartPlus}/>, title: "Add new entry", onClick: handleCreation},
                    // { content: <FontAwesomeIcon icon={faRotate}/>, title: "Refresh" },
                    // { content: <FontAwesomeIcon icon={faFileCsv}/>, title: "Export into CSV" },
                    // { content: <FontAwesomeIcon icon={faFilePdf}/>, title: "Export into PDF" },
                    {
                        content: <FontAwesomeIcon icon={faBroom}/>,
                        title: "Reset all filters",
                        onClick: async () => {
                            resetTransQueryParams();
                            setOption(prev => prev.label === defaultOption.label ? prev : defaultOption);
                        }
                    }
                ]}
            />
        </div>
    )
}

export default React.memo(TransactionsFilters);