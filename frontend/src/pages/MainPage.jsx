import Input from '../components/simple/Input.jsx';
import { useState, useRef, useMemo, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBroom, faBusinessTime, faCartPlus, faFileCsv, faFilePdf,
  faMagnifyingGlass, faPause, faPlay,
  faRotate
} from '@fortawesome/free-solid-svg-icons';
import Select from '../components/simple/Select.jsx';
import TransactionsList from '../components/transactions/TransactionsList.jsx';
import PillButtons from '../components/simple/PillButtons.jsx';
import { useModal } from '../context/ModalProvider.jsx';
import TransactionsForm from '../components/transactions/TransactionsForm.jsx';
import { useTransactions } from '../context/TransactionsProvider.jsx';
import { v4 as uuidv4 } from 'uuid';
import { createTimeFilters } from '../helpers/time.js';
import _ from 'lodash';
import IconButton from '../components/simple/IconButton.jsx';


const defaultOption = { label: "---Select the period---" }
const MainPage = () => {
  const [option, setOption] = useState(defaultOption);
  const [searchValue, setSearchValue] = useState("");
  const { addTransaction, queryTransParams, updateTransQueryParams, resetTransQueryParams } = useTransactions();
  const { showModal, hideModal } = useModal();
  const formRef = useRef(null);

  const debouncedSearch = useCallback(
    _.debounce((value) => {
      updateTransQueryParams({ filter: value })
    }, 500),
    [updateTransQueryParams]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  }

  const setValues = useCallback((from, to) => {
    updateTransQueryParams({ from, to });
  }, [updateTransQueryParams]);

  const options = useMemo(() => createTimeFilters(setValues, uuidv4), [setValues]);

  const addTrans = async (data) => {
    if (await addTransaction(data)) hideModal();
  }

  const onSubmitCreate = async () => {
    const fields = await formRef.current.getData();
    if (fields) await addTrans(fields);
  }

  const handleCreation = () => {
    showModal(
      "New transaction",
      <TransactionsForm onSubmit={addTrans} ref={formRef}/>,
      onSubmitCreate,
      false
    )
  }

  return (
    <>
      <div className={"grid mid:grid-cols-[4fr_4fr_2fr] max-mid:grid-cols-2 gap-2.5"}>
        <Input
          label={<IconButton title={"Reset name filter"} onClick={() => {
            resetTransQueryParams("filter")
            setSearchValue("")
          }} icon={faMagnifyingGlass}/>}
          lClassName={"!text-black"}
          wClassName={"field-row mid:col-start-1 mid:row-start-1 col-span-2"}
          placeholder={"Search by name..."}
          type={"text"}
          value={searchValue}
          id={"filter"}
          onChange={handleSearchChange}
        />

        <Select
          className={"field-row mid:row-start-2 mid:col-start-2 max-mid:row-start-2 max-mid:col-start-1 max-sml:row-start-2 max-sml:col-span-2"}
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
          wClassName={"field-row mid:row-start-1 mid:col-start-3 max-mid:row-start-2 max-mid:col-start-2 max-sml:row-start-3 max-sml:col-start-1 max-esml:row-start-3 max-esml:col-start-1 max-esml:col-span-2"}
          name={"to"}
          type={"date"}
          value={queryTransParams.to}
          id={"to"}
          onChange={(e) => {
            updateTransQueryParams({ to: e.target.value })
            setOption(prev => prev.label === defaultOption.label ? prev : defaultOption);
          }}
        />

        <Input
          label={<IconButton title={"Reset from-date"} onClick={() => {
            resetTransQueryParams("from")
          }} icon={faPlay}/>}
          lClassName={"!text-black"}
          wClassName={"field-row mid:row-start-2 mid:col-start-3 max-mid:row-start-3 max-mid:col-start-2 max-sml:row-start-3 max-sml:col-start-2 max-esml:col-start-1 max-esml:col-span-2 max-esml:row-start-4"}
          name={"from"}
          type={"date"}
          id={"for"}
          value={queryTransParams.from}
          onChange={(e) => {
            updateTransQueryParams({ from: e.target.value })
            setOption(prev => prev.label === defaultOption.label ? prev : defaultOption);
          }}
        />

        <PillButtons
          className={"mid:row-start-2 mid:col-start-1 justify-self-end max-mid:row-start-3 max-sml:row-start-4 max-sml:col-start-2 max-esml:row-start-5 max-esml:col-start-1 max-esml:col-span-2"}
          buttons={[
            { content: <FontAwesomeIcon icon={faCartPlus}/>, title: "Add new entry", onClick: handleCreation },
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
      <TransactionsList/>
    </>
  )
}

export default MainPage;