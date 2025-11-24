import { useCallback, useEffect, useRef } from 'react';
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
import { useForm } from 'react-hook-form';
import { transactionResolver } from '../../schemas/transactionSchema.js';
import Button from '../simple/Button.jsx';

const TransactionsForm = ({ ref, name, categoryId, price, timestamp, onSubmit }) => {
  const { categories, addCategory, editCategory, deleteCategory } = useCategories();
  const { data: catData, dataMap: catDataMap } = categories;
  const { showConfirmation } = useConfirmation();
  const { showModal, hideModal } = useModal();
  const catFormRef = useRef(null);

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
    setValue,
    clearErrors,
    watch
  } = useForm({
    resolver: transactionResolver,
    defaultValues: {
      name: name || "",
      categoryId: categoryId || "",
      price: price || "",
      timestamp: getDatetime(new Date(timestamp || Date.now()))
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  });

  const fields = watch();
  const validate = useCallback(async () => {
    const isValid = await trigger();

    if (!isValid) return null;
    return getValues();
  }, [trigger, getValues])

  useEffect(() => {
    if (ref) ref.current = {
      getData: validate
    }
  }, [ref, validate]);

  const editCat = async (id, data) => {
    const category = await editCategory(id, data);

    if (category) {
      if (category.id === fields.categoryId) setValue("categoryId", category.id);
      hideModal();
    }
  }

  const handleCatEdit = async (id) => {
    const data = await catFormRef.current.getData();
    if (!data) await editCat(id, data);
  }


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
              <CategoriesForm onSubmit={(data) => editCat(id, data)} ref={catFormRef} name={name} color={color}/>,
              () => handleCatEdit(id),
              false
            )
          }}/>
          <IconButton title={"Delete category"} size={"xs"} icon={faXmarkCircle} onClick={() => {
            showConfirmation(
              () => {
                deleteCategory(id)
                if (id === fields.categoryId) setValue("categoryId", "")
              },
              `'${name}' category`
            )
          }}/>
        </span>
      </span>
  }

  const addCat = async (data) => {
    const category = await addCategory(data);

    if (category) {
      setValue("categoryId", category.id);
      hideModal();
    }
  }

  const handleCatSave = async () => {
    const data = await catFormRef.current.getData();

    if (data) await addCat(data);
  }

  const options = catData.filter(cat => cat.id !== fields.categoryId).map(item => ({ label: formLabel(item), ...item }))
  const handleCatCreate = () => {
    showModal(
      "Add category",
      <CategoriesForm onSubmit={addCat} ref={catFormRef}/>,
      handleCatSave,
      false
    )
  }

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      if (onSubmit) {
        const data = await validate();

        if (data) onSubmit(data);
      }
    }} className={"form"}>
      <Input label={"Name"} id={"name"} type={"text"}{...register("name", {
        onChange: () => clearErrors("name")
      })} error={errors.name?.message}
      />

      <div className={"grid grid-cols-[2fr_1fr] gap-[10px]"}>
        <Input label={"Timestamp"} id={"timestamp"} type={"datetime-local"} {...register("timestamp", {
          onChange: () => clearErrors("timestamp")
        })} error={errors.timestamp?.message}
        />
        <Input label={"Price"} id={"price"} type={"number"} min={0} step={0.01} {...register("price", {
          onChange: () => clearErrors("price")
        })} error={errors.price?.message}
        />
      </div>

      <div className={"flex gap-[10px] items-end"}>
        <Select
          curValue={fields.categoryId ? formLabel(catDataMap[fields.categoryId]) : ""}
          lClassName={"flex items-center"}
          label={
            <>
              <span className={"mr-[3px]"}>Category</span>
              <IconButton
                onClick={handleCatCreate}
                className={"leading-0"}
                iconClassName={"!text-[var(--color-text)]"}
                title={"Add category"}
                icon={faFolderPlus}
              />
            </>
          }
          onOptionClick={({ id }) => setValue("categoryId", id, {
            shouldValidate: true
          })}
          options={options}
          error={errors.categoryId?.message}
        />
      </div>
      <Button type={"submit"} className={"hidden"} aria-hidden={"true"} tabIndex={-1}/>
    </form>
  );
};

export default TransactionsForm;