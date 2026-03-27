import {useMemo} from 'react';
import Input from '../simple/Input';
import { useForm } from 'react-hook-form';
import Button from '../simple/Button';
import {onFormSubmit, validateFields} from '../../helpers/utils';
import {changeEmailFormUtils, ChangeEmailSchema} from '../../resolvers/changeEmailResolver';
import {z} from "zod";
import {FormRef} from "../../types/basic";
import {forwardRef, useImperativeHandle} from "react";

interface ProfileEmailFormProps {
    onSubmit: () => ReturnType<typeof onFormSubmit<void>>
}

const ProfileEmailForm = forwardRef<FormRef, ProfileEmailFormProps>(({ onSubmit }, ref) => {
    const { resolver: changeEmailResolver, fieldsMeta } = useMemo(() => {
        return changeEmailFormUtils();
    }, []);

    const {
        register,
        trigger,
        getValues,
        formState: { errors },
        clearErrors,
        formState,
    } = useForm({
        resolver: changeEmailResolver,
        defaultValues: {
            email: "",
            confirmEmail: "",
            password: ""
        } satisfies Record<keyof z.infer<ChangeEmailSchema>, unknown>,
        mode: "onSubmit",
        reValidateMode: "onSubmit"
    })

    useImperativeHandle(ref, (): FormRef => {
        return {
            getData: () => validateFields(trigger, getValues(), formState.dirtyFields)
        }
    });

    return (
        <form onSubmit={async (e) => {
            e.preventDefault();
            onSubmit && await onSubmit()
        }} className={"form"}>
            <Input required={fieldsMeta.email.required} {...register("email", {
                onChange: () => clearErrors("email")
            })} error={errors.email} label={"New email"} id={"email"}/>
            <Input required={fieldsMeta.confirmEmail.required} {...register("confirmEmail", {
                onChange: () => clearErrors("confirmEmail")
            })} error={errors.confirmEmail} label={"Confirm new email"} id={"confirmEmail"}/>
            <Input type={"password"} required={fieldsMeta.password.required} {...register("password", {
                onChange: () => clearErrors("password")
            })} error={errors.password} label={"Current password"} id={"password"}/>

            <Button type={"submit"} className={"hidden"} aria-hidden={"true"} tabIndex={-1}/>
        </form>
    )
})

export default ProfileEmailForm;