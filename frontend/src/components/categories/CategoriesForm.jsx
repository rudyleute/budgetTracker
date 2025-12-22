import { useEffect, useMemo } from 'react';
import Input from '../simple/Input.jsx';
import ColorPicker from '../simple/ColorPicker.jsx';
import { useForm } from 'react-hook-form';
import { categoryFormUtils } from '../../resolvers/categoryResolver.js';
import Button from '../simple/Button.jsx';
import { validateFields } from '../../helpers/utils.js';

const CategoriesForm = ({ ref, color, name, onSubmit, isUpdate = false }) => {
  const { resolver: categoryResolver, fieldsMeta } = useMemo(() => {
    return categoryFormUtils();
  }, []);

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
      color: color || ""
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  })

  const fields = watch();

  useEffect(() => {
    if (ref) ref.current = {
      getData: () => validateFields(trigger, getValues(), formState.dirtyFields)
    }
  }, [formState.dirtyFields, getValues, isUpdate, ref, trigger]);

  useEffect(() => {
    //The color should be dirtied up before when creating a new category as there is a preset valid value
    if (!isUpdate) setValue("color", "#1100ff", { shouldDirty: true })
  }, [setValue, isUpdate, color]);

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      if (onSubmit) {
        const res = await validateFields(trigger, getValues(), formState.dirtyFields);
        if (res) onSubmit(res);
      }
    }} ref={ref} className={"form"}>
      <Input required={fieldsMeta.name.required} {...register("name", {
        onChange: () => clearErrors("name")
      })} error={errors.name?.message} label={"name"} id={"name"}/>
      <ColorPicker required={fieldsMeta.color.required} error={errors.color?.message} value={fields.color} onChange={(newColor) => setValue("color", newColor, {
        shouldValidate: true, shouldDirty: true
      })}/>

      <Button type={"submit"} className={"hidden"} aria-hidden={"true"} tabIndex={-1}/>
    </form>
  )
}

export default CategoriesForm;