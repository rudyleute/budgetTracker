import { useEffect } from 'react';
import Input from '../simple/Input.jsx';
import ColorPicker from '../simple/ColorPicker.jsx';
import { useForm } from 'react-hook-form';
import { categoryResolver } from '../../schemas/categorySchema.js';
import Button from '../simple/Button.jsx';
import { validateFields } from '../../helpers/utils.js';

const CategoriesForm = ({ ref, color, name, onSubmit, isUpdate = false }) => {
  const {
    register,
    trigger,
    getValues,
    formState: { errors },
    setValue,
    clearErrors,
    formState,
    watch
  } = useForm({
    resolver: categoryResolver,
    defaultValues: {
      name: name || "",
      color: ""
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  })

  const fields = watch();

  useEffect(() => {
    if (ref) ref.current = {
      getData: () => validateFields(trigger, getValues(), isUpdate ? formState.dirtyFields : null)
    }
  }, [formState.dirtyFields, getValues, isUpdate, ref, trigger]);

  useEffect(() => {
    //The color should be dirtied up before when creating a new category as there is a preset valid value
    if (isUpdate) setValue("color", color)
    else setValue("color", "#1100ff", { shouldDirty: true })
  }, [setValue, isUpdate, color]);

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      if (onSubmit) {
        const res = await validateFields(trigger, getValues(), isUpdate ? formState.dirtyFields : null);
        if (res) onSubmit(res);
      }
    }} ref={ref} className={"form"}>
      <Input {...register("name", {
        onChange: () => clearErrors("name")
      })} error={errors.name?.message} label={"name"} id={"name"}/>
      <ColorPicker error={errors.color?.message} value={fields.color} onChange={(newColor) => setValue("color", newColor, {
        shouldValidate: true, shouldDirty: true
      })}/>

      <Button type={"submit"} className={"hidden"} aria-hidden={"true"} tabIndex={-1}/>
    </form>
  )
}

export default CategoriesForm;