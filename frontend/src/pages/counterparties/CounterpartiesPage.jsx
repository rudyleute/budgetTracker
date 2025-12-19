import { useCallback, useState, useRef } from 'react';
import _ from 'lodash';
import IconButton from '../../components/simple/IconButton.jsx';
import { faBroom, faCartPlus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Input from '../../components/simple/Input.jsx';
import { useCounterparties } from '../../context/CounterpartiesProvider.jsx';
import CounterpartiesList from '../../components/counterparties/CounterpartiesList.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PillButtons from '../../components/simple/PillButtons.jsx';
import TransactionsForm from '../../components/transactions/TransactionsForm.jsx';
import { useModal } from '../../context/ModalProvider.jsx';
import CounterpartiesForm from '../../components/counterparties/CounterpartiesForm.jsx';

const CounterpartiesPage = () => {
  const [searchValue, setSearchValue] = useState("");
  const formRef = useRef(null);
  const { addCounterparty, updateCounterpartiesQueryParams, resetCounterpartiesQueryParams } = useCounterparties();
  const { showModal, hideModal } = useModal();

  const debouncedSearch = useCallback(
    _.debounce((value) => {
      updateCounterpartiesQueryParams({ filter: value })
    }, 500),
    [updateCounterpartiesQueryParams]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  }

  const onSubmitCreate = async () => {
    const fields = await formRef.current.getData();

    if (!fields) return null;

    const res = addCounterparty(fields);
    if (res) hideModal();

    return null;
  }

  const handleCreation = () => {
    showModal(
      "New counterparty",
      <CounterpartiesForm onSubmit={onSubmitCreate} ref={formRef}/>,
      onSubmitCreate,
      false
    )
  }

  return (
    <>
      <div className={"grid gap-[10px] sml:grid-cols-[1fr_20fr] max-sml:grid-cols-1"}>
        <PillButtons
          className={"max-sml:row-start-2 max-sml:justify-self-end"}
          buttons={[
            { content: <FontAwesomeIcon icon={faCartPlus}/>, title: "Add new entry", onClick: handleCreation },
            {
              content: <FontAwesomeIcon icon={faBroom}/>,
              title: "Reset all filters",
              onClick: async () => resetCounterpartiesQueryParams()
            }
          ]}
        />

        <Input
          label={<IconButton title={"Reset name filter"} onClick={() => {
            resetCounterpartiesQueryParams("filter")
            setSearchValue("")
          }} icon={faMagnifyingGlass}/>}
          lClassName={"!text-black"}
          wClassName={"field-row"}
          placeholder={"Search by name..."}
          type={"text"}
          value={searchValue}
          id={"filter"}
          onChange={handleSearchChange}
        />
      </div>
      <CounterpartiesList/>
    </>
  );
}

export default CounterpartiesPage;