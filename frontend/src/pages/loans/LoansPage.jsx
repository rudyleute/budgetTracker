import PillButtons from '../../components/simple/PillButtons.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDownWideShort,
  faBroom,
  faFileCirclePlus, faMoneyBillTransfer,
  faPause, faPlay,
  faUserGroup
} from '@fortawesome/free-solid-svg-icons';
import Autocomplete from '../../components/simple/Autocomplete.jsx';
import IconButton from '../../components/simple/IconButton.jsx';
import Select from '../../components/simple/Select.jsx';
import Input from '../../components/simple/Input.jsx';
import { useLoans } from '../../context/LoansProvider.jsx';
import React, { useCallback, useMemo, useRef } from 'react';
import { useModal } from '../../context/ModalProvider.jsx';
import useAutocomplete from '../../hooks/useAutocomplete.jsx';
import LoansForm from '../../components/loans/LoansForm.jsx';
import LoansList from '../../components/loans/LoansList.jsx';
import _ from 'lodash';

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

  const onCounterpartySelect = useCallback(
    (item) => updateLoansQueryParams({ counterparty: item.id }),
    [updateLoansQueryParams]
  );

  const { resetValue, ...restAutocompleteProps } = useAutocomplete({
    optionsEndpoint: "/counterparties",
    onOptionClick: onCounterpartySelect
  });

  const priorityOptions = useMemo(
    () => priorities.filter(priority => priority !== loansQueryParams.priority).map(priority => ({ label: priority })),
    [loansQueryParams.priority, priorities]
  );
  const typeOptions = useMemo(
    () => types.filter(type => type !== loansQueryParams.type).map(type => ({ label: type })),
    [loansQueryParams.type, types]
  );

  const onSubmitCreate = async () => {
    const fields = await formRef.current.getData();

    if (_.isEmpty(fields)) return null;

    const res = await addLoan(fields);
    if (res) hideModal();

    return res;
  }

  const handleCreation = () => {
    showModal(
      "New loan",
      <LoansForm onSubmit={onSubmitCreate} ref={formRef}/>,
      onSubmitCreate,
      false
    )
  }

  return (
    <>
      <div
        className={"grid gap-2.5 loans-fil-lrg:grid-cols-[1fr_10fr_10fr_10fr] loans-fil-mid:max-loans-fil-lrg:grid-cols-[1fr_10fr_10fr]" +
          " max-loans-fil-mid:grid-cols-[1fr_10fr] items-end"}>
        <PillButtons dir={"vertical"}
                     className={"row-span-2 row-start-1 max-loans-fil-mid:row-start-4 col-start-1 h-full"} buttons={[
          { content: <FontAwesomeIcon icon={faFileCirclePlus}/>, title: "Add a loan", onClick: handleCreation },
          {
            content: <FontAwesomeIcon icon={faBroom}/>,
            title: "Reset all filters",
            onClick: () => resetLoansQueryParams()
          }
        ]}/>
        <Autocomplete
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
          onOptionClick={({ label }) => updateLoansQueryParams({ priority: label })}
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
          onChange={(e) => updateLoansQueryParams({ to: e.target.value })}
        />

        <Input
          label={<IconButton title={"Reset lower date boundary"} onClick={() => resetLoansQueryParams(["from"])}
                             icon={faPlay}/>}
          lClassName={"!text-black"}
          wClassName={"field-row loans-fil-mid:max-loans-fil-lrg:row-start-2"}
          className={"min-h-full"}
          name={"from"}
          type={"date"}
          id={"for"}
          value={loansQueryParams.from}
          onChange={(e) => updateLoansQueryParams({ from: e.target.value })}
        />

        <Select
          lClassName={"!text-black"}
          className={"field-row max-loans-fil-lrg:row-start-3 max-loans-fil-mid:col-span-2"}
          label={<IconButton title={"Reset type"} onClick={() => resetLoansQueryParams(["type"])}
                             icon={faMoneyBillTransfer}/>}
          onOptionClick={({ label }) => updateLoansQueryParams({ type: label })}
          options={typeOptions}
          value={loansQueryParams.type || "--Select type--"}
        />
      </div>
      <LoansList />
    </>
  )
}

export default React.memo(LoansPage);