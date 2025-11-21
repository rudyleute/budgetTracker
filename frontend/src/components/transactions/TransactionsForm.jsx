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
import { getDatetime } from '../../helpers/transformers.jsx';

const TransactionsForm = ({ ref, name, categoryId, price, timestamp }) => {
  const { categories, addCategory, editCategory, deleteCategory } = useCategories();
  const { data: catData, dataMap: catDataMap } = categories;
  const { showConfirmation } = useConfirmation();
  const { showModal, hideModal } = useModal();
  const catFormRef = useRef(null);

  const [fields, setFields] = useState({
    name: name || "",
    categoryId: categoryId || "",
    price: price || null,
    timestamp: getDatetime(new Date(timestamp || Date.now()))
  });

  const formLabel = ({ id, name, color }) => {
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
              () => handleCatEdit(id),
              false
            )
          }}/>
          <IconButton title={"Delete category"} size={"xs"} icon={faXmarkCircle} onClick={() => {
            showConfirmation(
              () => {
                deleteCategory(id)
                if (id === fields.categoryId) setFields(prev => ({ ...prev, categoryId: "" }))
              },
              `'${name}' category`
            )
          }}/>
        </span>
      </span>
  }

  const handleCatEdit = async (id) => {
    const category = await editCategory(id, catFormRef.current.getData());

    if (category) {
      if (category.id === fields.categoryId) setFields(prev => ({ ...prev, categoryId: category.id }));
      hideModal();
    }
  }

  const handleCatSave = async () => {
    const category = await addCategory(catFormRef.current.getData());

    if (category) {
      setFields(prev => ({ ...prev, categoryId: category.id }));
      hideModal();
    }
  }

  useEffect(() => {
    if (ref) ref.current = { getData: () => fields }
  }, [ref, fields]);

  const options = catData.filter(cat => cat.id !== fields.categoryId).map(item => ({ label: formLabel(item), ...item }))
  const handleCatCreate = () => {
    showModal(
      "Add category",
      <CategoriesForm ref={catFormRef}/>,
      handleCatSave,
      false
    )
  }

  const handleOnChange = (e) => setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  return (
    <div className={"form"}>
      <Input label={"Name"} name={"name"} type={"text"} onChange={handleOnChange} value={fields.name}/>
      <div className={"grid grid-cols-[2fr_1fr] gap-[10px]"}>
        <Input label={"Time"} name={"timestamp"} type={"datetime-local"} onChange={handleOnChange}
               value={fields.timestamp}/>
        <Input label={"Price"} name={"price"} type={"number"} min={0} step={0.10} onChange={handleOnChange}
               value={fields.price ?? ""}/>
      </div>
      <div className={"flex gap-[10px] items-end"}>
        <Select curValue={fields.categoryId ? formLabel(catDataMap[fields.categoryId]) : ""}
                lClassName={"flex items-center"} label={<>
          <span className={"mr-[3px]"}>Category</span>
          <IconButton onClick={handleCatCreate} className={"leading-0"} iconClassName={"!text-[var(--color-text)]"}
                      title={"Add category"} icon={faFolderPlus}/>
        </>} onOptionClick={({ label, ...rest }) => setFields(prev => ({ ...prev, categoryId: rest.id }))}
                options={options}/>
      </div>
    </div>
  )
};

export default TransactionsForm;