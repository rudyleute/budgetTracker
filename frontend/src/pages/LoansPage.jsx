import { useLoans } from '../context/LoansProvider.jsx'
import Select from '../components/simple/Select.jsx';
import {
  faArrowDownWideShort,
  faFolderPlus,
  faHourglassEnd,
  faHourglassStart,
  faMoneyBillTransfer,
  faUserGroup
} from '@fortawesome/free-solid-svg-icons';
import { useMemo } from 'react';
import Input from '../components/simple/Input.jsx';
import useAutocomplete from '../hooks/useAutocomplete.jsx'
import Autocomplete from '../components/simple/Autocomplete.jsx';
import IconButton from '../components/simple/IconButton.jsx';

const LoansPage = () => {
  const {
    loans,
    loansQueryParams,
    addLoan,
    getNextLoansPage,
    updateLoansQueryParams,
    resetLoansQueryParams,
    LoansGetLoader,
    LoansChangeLoader,
    priorities,
    types
  } = useLoans();

  const {resetValue, ...restAutocompleteProps} = useAutocomplete({
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

  return (
    <div>
      <div className={"grid gap-[10px] grid-cols-[1fr_1fr_1fr] items-end"}>
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
          label={<IconButton title={"Reset priority"} onClick={() => resetLoansQueryParams(["priority"])} icon={faArrowDownWideShort}/>}
          onOptionClick={({ label }) => updateLoansQueryParams({ priority: label })}
          options={priorityOptions}
          value={loansQueryParams.priority || "--Select priority--"}
        />

        <Input
          label={<IconButton title={"Reset upper date boundary"} onClick={() => resetLoansQueryParams(["to"])} icon={faHourglassEnd}/>}
          lClassName={"!text-black"}
          wClassName={"field-row"}
          name={"to"}
          type={"date"}
          value={loansQueryParams.to}
          id={"to"}
          onChange={(e) => updateLoansQueryParams({ to: e.target.value })}
        />

        <Input
          label={<IconButton title={"Reset lower date boundary"} onClick={() => resetLoansQueryParams(["from"])} icon={faHourglassStart}/>}
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
          label={<IconButton title={"Reset type"} onClick={() => resetLoansQueryParams(["type"])} icon={faMoneyBillTransfer}/>}
          onOptionClick={({ label }) => updateLoansQueryParams({ type: label })}
          options={typeOptions}
          value={loansQueryParams.type || "--Select type--"}
        />
      </div>
    </div>
  )
}

export default LoansPage;