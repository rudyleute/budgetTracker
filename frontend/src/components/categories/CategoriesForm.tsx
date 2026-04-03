import {forwardRef, useEffect, useMemo} from 'react';
import Input from '../simple/Input';
import ColorPicker from '../simple/ColorPicker';
import {useForm} from 'react-hook-form';
import {categoryFormUtils, CategorySchemaType} from '../../resolvers/categoryResolver';
import Button from '../simple/Button';
import {FormRef, UpdatableFormProps} from "../../types/basic";
import {useFormRef} from "../../hooks/useFormRef";

type CategoriesFormProps = Omit<UpdatableFormProps, 'onSubmit'> & {
    onSubmit?: () => ReturnType<NonNullable<UpdatableFormProps['onSubmit']>>
} & (
    | { isUpdate: true } & {category: CategorySchemaType}
    | { isUpdate?: false }
    )

const CategoriesForm = forwardRef<FormRef, CategoriesFormProps>((props, ref) => {
    const {onSubmit, isUpdate} = props;
    const {color, name} = isUpdate ? props.category : {};

    const {resolver: categoryResolver, fieldsMeta} = useMemo(() => {
        return categoryFormUtils();
    }, []);

    const form = useForm({
        resolver: categoryResolver,
        defaultValues: {
            name: name || '',
            color: color || ''
        } satisfies Record<keyof CategorySchemaType, unknown>,
        mode: "onSubmit",
        reValidateMode: "onSubmit"
    });

    const {
        register,
        formState: {errors},
        setValue,
        clearErrors,
        watch
    } = form;

    useFormRef(ref, form);

    const fields = watch();
    useEffect(() => {
        //The color should be dirtied up before when creating a new category as there is a preset valid value
        if (!isUpdate) setValue("color", "#1100ff", {shouldDirty: true})
    }, [setValue, isUpdate, color]);

    return (
        <form onSubmit={async (e) => {
            e.preventDefault();
            onSubmit && onSubmit()
        }} className={"form"}>
            <Input required={fieldsMeta.name.required} {...register("name", {
                onChange: () => clearErrors("name")
            })} error={errors.name} label={"name"} id={"name"}/>
            <ColorPicker required={fieldsMeta.color.required} error={errors.color} value={fields.color}
                         onChange={(newColor) => setValue("color", newColor, {
                             shouldValidate: true, shouldDirty: true
                         })}/>

            <Button type={"submit"} className={"hidden"} aria-hidden={"true"} tabIndex={-1}/>
        </form>
    )
});

export default CategoriesForm;