import Input from '../components/simple/Input.jsx';
import { useContext, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglassEnd, faHourglassStart, faSearch } from '@fortawesome/free-solid-svg-icons';
import Button from '../components/simple/Button.jsx';

const Main = () => {
  const [values, setValues] = useState({
    filter: "",
    from: "",
    to: ""
  });
  const [isSelected, setIsSelected] = useState(false);

  return (
    <>
      <div className={"grid grid-cols-[8fr_2fr_6fr] gap-[20px]"}>
        <div className={"grid grid-rows-2 gap-[10px]"}>
          <Input placeholder={"Search by name..."} type={"text"} value={values.filter}
                 onChange={(e) => setValues(prev => ({ ...prev, filter: e.target.value }))}/>
          <Input type={"text"} wClassName={"!w-[40%] justify-self-end"} value={values.filter}
                 onChange={(e) => setValues(prev => ({ ...prev, filter: e.target.value }))}/>
        </div>
        <div className={"grid grid-rows-2 gap-[10px]"}>
          <Input label={
            <FontAwesomeIcon icon={faHourglassStart}/>
          } wClassName={"flex-row"} name={"from"} type={"date"} value={values.from}
                 onChange={(e) => setValues(prev => ({ ...prev, from: e.target.value }))}
          />
          <Input label={
            <FontAwesomeIcon icon={faHourglassEnd}/>
          } wClassName={"flex-row"} name={"to"} type={"date"} value={values.to}
                 onChange={(e) => setValues(prev => ({ ...prev, to: e.target.value }))}
          />
        </div>
      </div>
    </>
  )
}

export default Main;