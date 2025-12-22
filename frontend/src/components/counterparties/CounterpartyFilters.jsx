import PillButtons from '../simple/PillButtons.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDownWideShort,
  faBroom,
  faFileCirclePlus,
  faMoneyBillTransfer,
  faPause, faPlay
} from '@fortawesome/free-solid-svg-icons';
import Select from '../simple/Select.jsx';
import IconButton from '../simple/IconButton.jsx';
import Input from '../simple/Input.jsx';
import React, { useCallback, useMemo, useRef } from 'react';
import _ from 'lodash';
import LoansForm from '../loans/LoansForm.jsx';
import { useModal } from '../../context/ModalProvider.jsx';
import { useLoans } from '../../context/LoansProvider.jsx';

const CounterpartyFilters = ({counterparty}) => {
  const { updateLoansQueryParams, resetLoansQueryParams, priorities, types, loansQueryParams, addLoan } = useLoans();
  const { showModal, hideModal } = useModal();
  const formRef = useRef(null);

  const priorityOptions = useMemo(
    () => priorities.filter(priority => priority !== loansQueryParams.priority).map(priority => ({ label: priority })),
    [loansQueryParams.priority, priorities]
  );

  const typeOptions = useMemo(
    () => types.filter(type => type !== loansQueryParams.type).map(type => ({ label: type })),
    [loansQueryParams.type, types]
  );

  const onSubmitCreate = useCallback(async () => {
    const fields = await formRef.current.getData();

    if (_.isEmpty(fields)) return null;

    const res = await addLoan(fields);
    if (res) hideModal();

    return res;
  }, [addLoan, hideModal]);

  const handleCreation = useCallback(() => {
    showModal(
      "New loan",
      <LoansForm onSubmit={onSubmitCreate} ref={formRef} counterparty={counterparty}/>,
      onSubmitCreate,
      false
    )
  }, [counterparty, onSubmitCreate, showModal]);

  return (
    <div
      className={"grid gap-2.5 filters-4-grid items-end animate-fade-in"}>
      <PillButtons className={"filters-4-btns h-full"} buttons={[
        { content: <FontAwesomeIcon icon={faFileCirclePlus}/>, title: "Add a loan", onClick: handleCreation },
        {
          content: <FontAwesomeIcon icon={faBroom}/>,
          title: "Reset all filters",
          onClick: () => resetLoansQueryParams([], "counterparty")
        }
      ]}/>

      <Select
        className={"field-row filters-4-1"}
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
        wClassName={"field-row filters-4-2"}
        className={"min-h-full"}
        name={"to"}
        type={"date"}
        value={loansQueryParams.to}
        id={"to"}
        onChange={(e) => updateLoansQueryParams({ to: e.target.value })}
      />

      <Select
        lClassName={"!text-black"}
        className={"field-row filters-4-3"}
        label={<IconButton title={"Reset type"} onClick={() => resetLoansQueryParams(["type"])}
                           icon={faMoneyBillTransfer}/>}
        onOptionClick={({ label }) => updateLoansQueryParams({ type: label })}
        options={typeOptions}
        value={loansQueryParams.type || "--Select type--"}
      />

      <Input
        label={<IconButton title={"Reset lower date boundary"} onClick={() => resetLoansQueryParams(["from"])}
                           icon={faPlay}/>}
        lClassName={"!text-black"}
        wClassName={"field-row filters-4-4"}
        className={"min-h-full"}
        name={"from"}
        type={"date"}
        id={"for"}
        value={loansQueryParams.from}
        onChange={(e) => updateLoansQueryParams({ from: e.target.value })}
      />
    </div>
  )
}

export default React.memo(CounterpartyFilters);