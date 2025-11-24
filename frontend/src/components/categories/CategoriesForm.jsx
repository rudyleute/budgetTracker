import { useCallback, useEffect } from 'react';
import Input from '../simple/Input.jsx';
import ColorPicker from '../simple/ColorPicker.jsx';
import { useForm } from 'react-hook-form';
import { categoryResolver } from '../../schemas/categorySchema.js';
import Button from '../simple/Button.jsx';

const CategoriesForm = ({ ref, color, name, onSubmit }) => {
  const {
    register,
    trigger,
    getValues,
    formState: { errors },
    setValue,
    clearErrors,
    watch
  } = useForm({
    resolver: categoryResolver,
    defaultValues: {
      name: name || "",
      color: color || "#1100ff"
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  })

  const fields = watch();
  const validate = useCallback(async () => {
    const isValid = await trigger();

    if (!isValid) return null;
    return getValues();
  }, [getValues, trigger])

  useEffect(() => {
    if (ref) ref.current = {
      getData: validate
    }
  }, [ref, validate]);

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      if (onSubmit) {
        const res = await validate();
        if (res) onSubmit(res);
      }
    }} ref={ref} className={"form"}>
      <Input {...register("name", {
        onChange: () => clearErrors("name")
      })} error={errors.name?.message} label={"name"} id={"name"}/>
      <ColorPicker error={errors.color?.message} value={fields.color} onChange={(newColor) => setValue("color", newColor, {
        shouldValidate: true
      })}/>

      <Button type={"submit"} className={"hidden"} aria-hidden={"true"} tabIndex={-1}/>
    </form>
  )
}

export default CategoriesForm;