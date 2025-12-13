import { useLoans } from '../context/LoansProvider.jsx'
import Select from '../components/simple/Select.jsx';
import {
  faArrowDownWideShort, faBroom, faFileCirclePlus,
  faHourglassEnd,
  faHourglassStart,
  faMoneyBillTransfer,
  faUserGroup
} from '@fortawesome/free-solid-svg-icons';
import { useMemo, useRef } from 'react';
import Input from '../components/simple/Input.jsx';
import useAutocomplete from '../hooks/useAutocomplete.jsx'
import Autocomplete from '../components/simple/Autocomplete.jsx';
import IconButton from '../components/simple/IconButton.jsx';
import LoansList from '../components/loans/LoansList.jsx';
import PillButtons from '../components/simple/PillButtons.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useModal } from '../context/ModalProvider.jsx';
import LoansForm from '../components/loans/LoansForm.jsx';

const LoansPage = () => {
  const {
    loansQueryParams,
    updateLoansQueryParams,
    resetLoansQueryParams,
    priorities,
    types,
    addLoan
  } = useLoans();
  const formRef = useRef(null);
  const { showModal, hideModal } = useModal();

  const { resetValue, ...restAutocompleteProps } = useAutocomplete({
    optionsEndpoint: "/counterparties",
    onOptionClick: (item) => updateLoansQueryParams({ counterparty: item.id })
  });

  const priorityOptions = useMemo(
    () => priorities.filter(priority => priority !== loansQueryParams.priority).map(priority => ({ label: priority })),
    [loansQueryParams.priority, priorities]
  );
  const typeOptions = useMemo(
    () => types.filter(type => type !== loansQueryParams.type).map(type => ({ label: type })),
    [loansQueryParams.type, types]
  );

  const addLoanWithHide = async (data) => {
    if (await addLoan(data)) hideModal();
  }

  const onSubmitCreate = async () => {
    const fields = await formRef.current.getData();
    if (fields) await addLoanWithHide(fields);
  }

  const handleCreation = () => {
    showModal(
      "New loan",
      <LoansForm onSubmit={addLoanWithHide} ref={formRef}/>,
      onSubmitCreate,
      false
    )
  }

  return (
    <>
      <div className={"flex gap-[10px]"}>
        <PillButtons dir={"vertical"} className={"row-span-2 row-start-1 col-start-1"} buttons={[
          { content: <FontAwesomeIcon icon={faFileCirclePlus}/>, title: "Add a loan", onClick: handleCreation },
          {
            content: <FontAwesomeIcon icon={faBroom}/>,
            title: "Reset all filters",
            onClick: () => resetLoansQueryParams()
          }
        ]}/>
        <div className={"grid gap-[10px] grid-cols-[1fr_1fr_1fr] items-end grow"}>
          <Autocomplete
            {...restAutocompleteProps}
            id={"counterparty"}
            label={<IconButton title={"Reset counterparty"} onClick={() => {
              resetLoansQueryParams("counterparty")
              resetValue()
            }} icon={faUserGroup}/>}
            className={"field-row col-span-2"}
            lClassName={"!text-black"}
            placeholder={"Search for counterparty"}
          />

          <Select
            className={"field-row"}
            lClassName={"!text-black"}
            label={<IconButton title={"Reset priority"} onClick={() => resetLoansQueryParams(["priority"])}
                               icon={faArrowDownWideShort}/>}
            onOptionClick={({ label }) => updateLoansQueryParams({ priority: label })}
            options={priorityOptions}
            value={loansQueryParams.priority || "--Select priority--"}
          />

          <Input
            label={<IconButton title={"Reset upper date boundary"} onClick={() => resetLoansQueryParams(["to"])}
                               icon={faHourglassEnd}/>}
            lClassName={"!text-black"}
            wClassName={"field-row"}
            name={"to"}
            type={"date"}
            value={loansQueryParams.to}
            id={"to"}
            onChange={(e) => updateLoansQueryParams({ to: e.target.value })}
          />

          <Input
            label={<IconButton title={"Reset lower date boundary"} onClick={() => resetLoansQueryParams(["from"])}
                               icon={faHourglassStart}/>}
            lClassName={"!text-black"}
            wClassName={"field-row"}
            name={"from"}
            type={"date"}
            id={"for"}
            value={loansQueryParams.from}
            onChange={(e) => updateLoansQueryParams({ from: e.target.value })}
          />

          <Select
            lClassName={"!text-black"}
            className={"field-row"}
            label={<IconButton title={"Reset type"} onClick={() => resetLoansQueryParams(["type"])}
                               icon={faMoneyBillTransfer}/>}
            onOptionClick={({ label }) => updateLoansQueryParams({ type: label })}
            options={typeOptions}
            value={loansQueryParams.type || "--Select type--"}
          />
        </div>
      </div>
      <LoansList/>
    </>
  )
}

export default LoansPage;