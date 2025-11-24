import { useEffect } from 'react';
import Input from '../simple/Input.jsx';
import ColorPicker from '../simple/ColorPicker.jsx';
import { useForm } from 'react-hook-form';
import { categoryResolver } from '../../schemas/categorySchema.js';

const CategoriesForm = ({ ref, color, name }) => {
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
    }
  })

  const fields = watch();

  useEffect(() => {
    if (ref) ref.current = {
      getData: async () => {
        const isValid = await trigger();

        if (!isValid) return null;
        return getValues();
      }
    }
  }, [ref, fields, getValues, trigger]);

  return (
    <div ref={ref} className={"form"}>
      <Input {...register("name", {
        onChange: () => clearErrors("name")
      })} error={errors.name?.message} label={"name"}/>
      <ColorPicker error={errors.color?.message} value={fields.color} onChange={(newColor) => setValue("color", newColor, {
        shouldValidate: true
      })}/>
    </div>
  )
}

export default CategoriesForm;