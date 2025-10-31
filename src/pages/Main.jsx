import Input from '../components/simple/Input.jsx';
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglassEnd, faHourglassStart } from '@fortawesome/free-solid-svg-icons';
import Select from '../components/simple/Select.jsx';

const options = [
  {label: "--Select time filter--", func: () => console.log("--Select time filter--"), isDefault: true},
  {label: "Today", func: () => console.log("Today")},
  {label: "Yesterday", func: () => console.log("Yesterday")},
  {label: "Last week", func: () => console.log("Last week")},
  {label: "Last week", func: () => console.log("Last week")},
  {label: "This month", func: () => console.log("This month")},
  {label: "Last month", func: () => console.log("Last month")},
  {label: "Last three month", func: () => console.log("Last three month")},
  {label: "This year", func: () => console.log("This year")},
  {label: "Last year", func: () => console.log("Last year")},
]
const Main = () => {
  const [values, setValues] = useState({
    filter: "",
    from: "",
    to: ""
  });
  const [isSelected, setIsSelected] = useState(false);

  const handleOptionClick = (option) => {
    if (option?.isDefault) {
      setIsSelected(false);
      setValues(prev => ({...prev, from: "", to: ""}));
    } else setIsSelected(true);
    option.func()
  }

  return (
    <>
      <div className={"grid grid-cols-[8fr_2fr_6fr] gap-[20px]"}>
        <div className={"flex flex-col items-end gap-[10px] min-w-0"}>
          <Input placeholder={"Search by name..."} type={"text"} value={values.filter}
                 onChange={(e) => setValues(prev => ({ ...prev, filter: e.target.value }))}/>
          <Select onOptionClick={handleOptionClick} className={"!w-[50%]"} options={options}/>
        </div>
        <div className={"flex flex-col gap-[10px]"}>
          <Input label={
            <FontAwesomeIcon icon={faHourglassStart}/>
          } wClassName={"!flex-row"} name={"from"} type={"date"} value={values.from}
                 onChange={(e) => setValues(prev => ({ ...prev, from: e.target.value }))}
          />
          <Input label={
            <FontAwesomeIcon icon={faHourglassEnd}/>
          } wClassName={"!flex-row"} name={"to"} type={"date"} value={values.to}
                 onChange={(e) => setValues(prev => ({ ...prev, to: e.target.value }))}
          />
        </div>
      </div>
    </>
  )
}

export default Main;