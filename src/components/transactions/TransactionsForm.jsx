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
import { getDatetime } from '../../helpers/transformers.js';
import _ from 'lodash';

const TransactionsForm = ({ ref, name, category, price, createdAt }) => {
  const { categories, addCategory, editCategory, deleteCategory } = useCategories();
  const { showConfirmation } = useConfirmation();
  const { showModal } = useModal();
  const catFormRef = useRef(null);

  const formLabel = ({id, name, color}) => {
    return <span className={"flex items-center justify-between gap-[10px]"}>
        <span className={"text-clipped"}>
          <Color value={color}/>
          <span className={"ml-[10px]"}>{name}</span>
        </span>
        <span>
          <IconButton title={"Edit category"} size={"xs"} icon={faPenToSquare} onClick={() => {
            showModal(
              "Edit category",
              <CategoriesForm ref={catFormRef} name={name} color={color}/>,
              () => handleCatEdit(id)
            )
          }}/>
          <IconButton title={"Delete category"} size={"xs"} icon={faXmarkCircle} onClick={() => {
            showConfirmation(
              () => {
                deleteCategory(id)
                setFields(prev => ({...prev, category: {}}))
              },
              `'${name}' category`
            )
          }}/>
        </span>
      </span>
  }

  const [fields, setFields] = useState({
    name: name || "",
    category: category || {},
    price: price || null,
    createdAt: createdAt?.slice(0, 16) || getDatetime(new Date()),
  });

  const handleCatEdit = async (id) => {
    const category = await editCategory(id, catFormRef.current.getData())
    setFields(prev => ({ ...prev, category: {...category, label: formLabel(category)} }));
  }

  const handleCatSave = async () => {
    const category = await addCategory(catFormRef.current.getData());
    setFields(prev => ({ ...prev, category }));
  }

  useEffect(() => {
    if (ref) ref.current = { getData: () => fields }
  }, [ref, fields]);

  const options = categories.filter(cat => cat.id !== fields.category?.id).map(item => ({ label: formLabel(item), ...item }))

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
        <Select curValue={!_.isEmpty(fields.category) ? formLabel(fields.category) : ""} lClassName={"flex items-center"} label={<>
          <span className={"mr-[3px]"}>Category</span>
          <IconButton onClick={handleCatCreate} className={"leading-0"} iconClassName={"!text-white"}
                      title={"Add category"} icon={faFolderPlus}/>
        </>} onOptionClick={(category) => setFields(prev => ({ ...prev, category }))}
                options={options}/>
      </div>
    </div>
  )
};

export default TransactionsForm;