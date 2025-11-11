import Input from '../components/simple/Input.jsx';
import { useState, useRef, useMemo, useEffect } from 'react'
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
import { createTimeFilters } from '../helpers/transformers.js';

const defaultValue = {
  filter: "",
  from: "",
  to: "",
  option: {label: "---Select filter---"}
};

const Main = () => {
  const [values, setValues] = useState(defaultValue);
  const options = useMemo(() => createTimeFilters(setValues, uuidv4), [setValues]);

  const { showModal } = useModal();
  const { addTransaction } = useTransactions();
  const formRef = useRef(null);

  const handleCreation = () => {
    showModal(
      "New transaction",
      <TransactionsForm ref={formRef}/>,
      () => addTransaction(formRef.current.getData())
    )
  }

  return (
    <>
      <div className={"grid grid-cols-[8fr_2fr] gap-[20px] mb-[10px]"}>
        <div className={"flex flex-col gap-[10px] min-w-0"}>
          <Input placeholder={"Search by name..."} type={"text"} value={values.filter}
                 onChange={(e) => setValues(prev => ({ ...prev, filter: e.target.value }))}/>
          <div className={"grid grid-cols-2 items-center gap-[10px]"}>
            <PillButtons className={"justify-self-end"} buttons={[
              { content: <FontAwesomeIcon icon={faCartPlus}/>, title: "Add new entry", onClick: handleCreation },
              { content: <FontAwesomeIcon icon={faRotate}/>, title: "Refresh" },
              { content: <FontAwesomeIcon icon={faFileCsv}/>, title: "Export into CSV" },
              { content: <FontAwesomeIcon icon={faFilePdf}/>, title: "Export into PDF" },
              { content: <FontAwesomeIcon icon={faBroom}/>, title: "Reset all filters", onClick: () => setValues(defaultValue) }
            ]}/>
            <Select curValue={values.option.label} onOptionClick={(option) => setValues(prev => ({...prev, option}))} options={
              options.filter(opt => opt.label !== values.option?.label)
            }/>
          </div>
        </div>
        <div className={"flex flex-col gap-[10px]"}>
          <Input label={
            <FontAwesomeIcon icon={faHourglassStart}/>
          } lClassName={"!text-black"} wClassName={"!flex-row items-center"} name={"from"} type={"date"} value={values.from}
                 onChange={(e) => setValues(prev => ({ ...prev, from: e.target.value, option: defaultValue.option }))}
          />
          <Input label={
            <FontAwesomeIcon icon={faHourglassEnd}/>
          } lClassName={"!text-black"} wClassName={"!flex-row items-center"} name={"to"} type={"date"} value={values.to}
                 onChange={(e) => setValues(prev => ({ ...prev, to: e.target.value, option: defaultValue.option }))}
          />
        </div>
      </div>
      <TransactionsList/>
    </>
  )
}

export default Main;