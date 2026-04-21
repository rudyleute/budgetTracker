import {forwardRef, useMemo} from 'react';
import { useForm } from 'react-hook-form';
import { counterpartyFormUtils } from '../../resolvers/counterpartyResolver';
import Button from '../simple/Button';
import Input from '../simple/Input';
import Textarea from '../simple/Textarea';
import {CounterpartyGetClient} from "../../types/components/mappings";
import {FormRef} from "../../types/basic";
import {CounterpartySchemaType} from "../../resolvers/counterpartyResolver";
import {useFormRef} from "../../hooks/useFormRef";

interface CounterpartiesFormProps {
    data?: CounterpartyGetClient,
    onSubmit?: () => unknown
}
const CounterpartiesForm = forwardRef<FormRef, CounterpartiesFormProps>(({ data = {} as NonNullable<CounterpartiesFormProps['data']>, onSubmit }, ref) => {
    const { resolver: counterpartyResolver, fieldsMeta } = useMemo(() => {
        return counterpartyFormUtils();
    }, []);

    const { name, phone, email, note } = data;
    const form = useForm({
        resolver: counterpartyResolver,
        defaultValues: {
            name: name || "",
            phone: phone || "",
            email: email || "",
            note: note || ""
        } satisfies Record<keyof CounterpartySchemaType, unknown>,
        mode: "onSubmit",
        reValidateMode: "onSubmit"
    });

    const {
        register,
        formState: { errors },
        clearErrors,
    } = form;

    useFormRef(ref, form);

    return (
        <form onSubmit={async (e) => {
            e.preventDefault();
            onSubmit && onSubmit();
        }} className={"grid grid-cols-1 gap-2.5"}>
            <Input required={fieldsMeta.name.required} label={<>Name</>} id={"name"}
                   type={"text"} {...register("name", {
                onChange: () => clearErrors("name")
            })} error={errors.name}
            />
            <Input required={fieldsMeta.phone.required} label={<>Phone</>} id={"phone"}
                   type={"text"} {...register("phone", {
                onChange: () => clearErrors("phone")
            })} error={errors.phone}
            />
            <Input required={fieldsMeta.email.required} label={<>Email</>} id={"email"}
                   type={"email"} {...register("email", {
                onChange: () => clearErrors("email")
            })} error={errors.email}
            />
            <Textarea required={fieldsMeta.note.required} rows={5} className={"text-xl"} label={<>Note</>} id={"note"}
                      {...register("note", {
                          onChange: () => clearErrors("note")
                      })} error={errors.note}
            />
            <Button type={"submit"} className={"hidden"} aria-hidden={"true"} tabIndex={-1}/>
        </form>
    );
})

export default CounterpartiesForm;