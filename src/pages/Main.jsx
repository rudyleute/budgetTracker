import Input from '../components/simple/Input.jsx';
import { useState } from 'react'
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
import TransactionForm from '../components/transactions/TransactionForm.jsx';

const options = [
  { label: "--Select time filter--", func: () => console.log("--Select time filter--"), isDefault: true },
  { label: "Today", func: () => console.log("Today") },
  { label: "Yesterday", func: () => console.log("Yesterday") },
  { label: "Last week", func: () => console.log("Last week") },
  { label: "Last week", func: () => console.log("Last week") },
  { label: "This month", func: () => console.log("This month") },
  { label: "Last month", func: () => console.log("Last month") },
  { label: "Last three month", func: () => console.log("Last three month") },
  { label: "This year", func: () => console.log("This year") },
  { label: "Last year", func: () => console.log("Last year") }
]
const Main = () => {
  const [values, setValues] = useState({
    filter: "",
    from: "",
    to: ""
  });
  const [isSelected, setIsSelected] = useState(false);
  const { showModal } = useModal();

  const handleOptionClick = (option) => {
    if (option?.isDefault) {
      setIsSelected(false);
      setValues(prev => ({ ...prev, from: "", to: "" }));
    } else setIsSelected(true);
    option.func()
  }

  const handleCreation = () => {
    showModal(
      "New expense",
      <TransactionForm />,
      null,
      () => alert("New expense has been created"),
      true
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
              { content: <FontAwesomeIcon icon={faBroom}/>, title: "Reset all filters" }
            ]}/>
            <Select onOptionClick={handleOptionClick} options={options}/>
          </div>
        </div>
        <div className={"flex flex-col gap-[10px]"}>
          <Input label={
            <FontAwesomeIcon icon={faHourglassStart}/>
          } lClassName={"text-black"} wClassName={"!flex-row items-center"} name={"from"} type={"date"} value={values.from}
                 onChange={(e) => setValues(prev => ({ ...prev, from: e.target.value }))}
          />
          <Input label={
            <FontAwesomeIcon icon={faHourglassEnd}/>
          } lClassName={"text-black"} wClassName={"!flex-row items-center"} name={"to"} type={"date"} value={values.to}
                 onChange={(e) => setValues(prev => ({ ...prev, to: e.target.value }))}
          />
        </div>
      </div>
      <TransactionsList/>
    </>
  )
}

export default Main;