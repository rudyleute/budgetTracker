import Input from '../components/simple/Input.jsx';
import { useState, useRef, useMemo, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBroom, faCartPlus, faFileCsv, faFilePdf,
  faHourglassEnd,
  faHourglassStart,
  faRotate
} from '@fortawesome/free-solid-svg-icons';
import Select from '../components/simple/Select.jsx';
import TransactionsList from '../components/transactions/TransactionsList.jsx';
import PillButtons from '../components/simple/PillButtons.jsx';
import { useModal } from '../context/ModalProvider.jsx';
import TransactionsForm from '../components/transactions/TransactionsForm.jsx';
import { useTransactions } from '../context/TransactionsProvider.jsx';
import { v4 as uuidv4 } from 'uuid';
import { createTimeFilters } from '../helpers/transformers.jsx';


const defaultOption = { label: "---Select filter---" }
const Main = () => {
  const [option, setOption] = useState(defaultOption);
  const { addTransaction,  queryParams, updateQueryParams, resetQueryParams } = useTransactions();
  const { showModal, hideModal } = useModal();
  const formRef = useRef(null);

  const setValues = useCallback((from, to) => {
    updateQueryParams({from, to});
  }, [updateQueryParams]);

  const options = useMemo(() => createTimeFilters(setValues, uuidv4), [setValues]);

  const handleCreation = () => {
    showModal(
      "New transaction",
      <TransactionsForm ref={formRef}/>,
      async () => {
        const res = await addTransaction(formRef.current.getData())

        if (res) hideModal();
      },
      false
    )
  }

  return (
    <>
      <div className={"grid grid-cols-[8fr_2fr] gap-[20px] mb-[10px]"}>
        <div className={"flex flex-col gap-[10px] min-w-0"}>
          <Input placeholder={"Search by name..."} type={"text"} value={queryParams.filter}
                 onChange={(e) => updateQueryParams({ filter: e.target.value })}/>
          <div className={"grid grid-cols-2 items-center gap-[10px]"}>
            <PillButtons className={"justify-self-end"} buttons={[
              { content: <FontAwesomeIcon icon={faCartPlus}/>, title: "Add new entry", onClick: handleCreation },
              { content: <FontAwesomeIcon icon={faRotate}/>, title: "Refresh" },
              { content: <FontAwesomeIcon icon={faFileCsv}/>, title: "Export into CSV" },
              { content: <FontAwesomeIcon icon={faFilePdf}/>, title: "Export into PDF" },
              {
                content: <FontAwesomeIcon icon={faBroom}/>, title: "Reset all filters", onClick: async () => {
                  resetQueryParams();
                  setOption(defaultOption);
                }
              }
            ]}/>
            <Select curValue={option.label} onOptionClick={(option) => setOption(option)}
                    options={ options.filter(opt => opt.label !== option?.label) }/>
          </div>
        </div>
        <div className={"flex flex-col gap-[10px]"}>
          <Input label={
            <FontAwesomeIcon icon={faHourglassStart}/>
          } lClassName={"!text-black"} wClassName={"!flex-row items-center"} name={"from"} type={"date"}
                 value={queryParams.from}
                 onChange={(e) => updateQueryParams({ from: e.target.value })}
          />
          <Input label={
            <FontAwesomeIcon icon={faHourglassEnd}/>
          } lClassName={"!text-black"} wClassName={"!flex-row items-center"} name={"to"} type={"date"}
                 value={queryParams.to}
                 onChange={(e) => updateQueryParams({ to: e.target.value })}
          />
        </div>
      </div>
      <TransactionsList />
    </>
  )
}

export default Main;