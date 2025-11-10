import { useEffect, useRef, useState } from 'react';
import Input from '../simple/Input.jsx';
import Select from '../simple/Select.jsx';
import { useCategories } from '../../context/CategoriesProvider.jsx';
import { useModal } from '../../context/ModalProvider.jsx';
import Color from '../simple/Color.jsx';
import { faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../simple/IconButton.jsx';
import CategoriesForm from '../categories/CategoriesForm.jsx';
import { faPenToSquare, faXmarkCircle } from '@fortawesome/free-regular-svg-icons';
import { useConfirmation } from '../../context/ConfirmationProvider.jsx';

const TransactionsForm = ({ ref, name, category, price, createdAt }) => {
  const { categories, addCategory, editCategory, deleteCategory } = useCategories();
  const { showConfirmation } = useConfirmation();
  const { showModal } = useModal();
  const catFormRef = useRef(null);

  const [fields, setFields] = useState({
    name: name || "",
    category: category || {},
    price: price || null,
    createdAt: createdAt?.slice(0, 16) || (new Date()).toISOString().slice(0, 16)
  });

  useEffect(() => {
    if (ref) ref.current = { getData: () => fields }
  }, [ref, fields]);

  const options = categories.map(item => {
    const { color, name, id } = item;

    return {
      label: <span className={"flex items-center justify-between gap-[10px]"}>
        <span className={"text-clipped"}>
          <Color value={color}/>
          <span className={"ml-[10px]"}>{name}</span>
        </span>
        <span>
          <IconButton title={"Edit category"} size={"xs"} icon={faPenToSquare} onClick={() => {
            showModal(
              "Edit category",
              <CategoriesForm ref={catFormRef} name={name} color={color}/>,
              () => editCategory(id, catFormRef.current.getData())
            )
          }}/>
          <IconButton title={"Delete category"} size={"xs"} icon={faXmarkCircle} onClick={() => {
            showConfirmation(
              () => deleteCategory(id),
              `'${name}' category`
            )
          }}/>
        </span>
      </span>,
      ...item,
      isDefault: fields.category?.id === id
    }
  })

  const handleCatSave = async () => {
    const category = await addCategory(catFormRef.current.getData());
    setFields(prev => ({ ...prev, category }));
  }

  const handleCatCreate = () => {
    showModal(
      "Add category",
      <CategoriesForm ref={catFormRef}/>,
      handleCatSave
    )
  }

  const handleOnChange = (e) => setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  return (
    <div className={"form"}>
      <Input label={"Name"} name={"name"} type={"text"} onChange={handleOnChange} value={fields.name}/>
      <div className={"grid grid-cols-[2fr_1fr] gap-[10px]"}>
        <Input label={"Time"} name={"createdAt"} type={"datetime-local"} onChange={handleOnChange}
               value={fields.createdAt}/>
        <Input label={"Price"} name={"price"} type={"number"} min={0} onChange={handleOnChange}
               value={fields.price ?? ""}/>
      </div>
      <div className={"flex gap-[10px] items-end"}>
        <Select lClassName={"flex items-center"} label={<>
          <span className={"mr-[3px]"}>Category</span>
          <IconButton onClick={handleCatCreate} className={"leading-0"} iconClassName={"!text-white"}
                      title={"Add category"} icon={faFolderPlus}/>
        </>} onOptionClick={({ label, ...rest }) => setFields(prev => ({ ...prev, category: rest }))}
                options={options}/>
      </div>
    </div>
  )
};

export default TransactionsForm;