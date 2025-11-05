import { useState } from 'react';
import Input from '../simple/Input.jsx';
import Select from '../simple/Select.jsx';
import { useCategories } from '../../context/CategoriesProvider.jsx';
import { useModal } from '../../context/ModalProvider.jsx';
import Color from '../simple/Color.jsx';
import PillButtons from '../simple/PillButtons.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faFolderPlus, faPlus, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../simple/IconButton.jsx';

const TransactionForm = ({ ref, name, category, price, timestamp }) => {
  const { categories } = useCategories();
  const { showModal } = useModal();

  const [fields, setFields] = useState({
    name: name || "",
    category: category || {},
    price: price || null,
    timestamp: timestamp || (new Date()).toISOString().slice(0, 16)
  });

  const options = categories.map(item => {
    const { color, name } = item;
    return {
      label: <span className={"flex items-center gap-[10px]"}>
        <Color value={color}/>
        <span className={"text-clipped"}>{name}</span>
      </span>
    }
  })

  const handleCatCreate = () => {
    showModal(
      "Add category",
      "Add new category",
      () => alert("Close category"),
      () => alert("Save category")
    )
  }

  const handleOnChange = (e) => setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  return (
    <div ref={ref} className={"text-black"}>
      <Input label={"Name"} name={"name"} type={"text"} onChange={handleOnChange} value={fields.name}/>
      <div className={"grid grid-cols-[2fr_1fr] gap-[10px] mt-[10px] mb-[10px]"}>
        <Input label={"Time"} name={"timestamp"} type={"datetime-local"} onChange={handleOnChange}
               value={fields.timestamp}/>
        <Input label={"Price"} name={"price"} type={"number"} min={0} onChange={handleOnChange}
               value={fields.price ?? ""}/>
      </div>
      <div className={"flex gap-[10px] items-end"}>
        <Select lClassName={"flex items-center"} label={<>
          <span className={"mr-[3px]"}>Category</span>
          <IconButton onClick={handleCatCreate} className={"leading-0"} iconClassName={"!text-white"} title={"Add category"} icon={faFolderPlus}/>
        </>} onOptionClick={(item) => setFields(prev => ({ ...prev, category: item }))} options={options}/>
      </div>

    </div>
  )
};

export default TransactionForm;