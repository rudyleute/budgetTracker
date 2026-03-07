import { useEffect, useMemo } from 'react';
import Input from '../simple/Input.jsx';
import { useForm } from 'react-hook-form';
import Button from '../simple/Button.jsx';
import { validateFields } from '../../helpers/utils.js';
import { changeEmailFormUtils } from '../../resolvers/changeEmailResolver.js';

const ProfileEmailForm = ({ ref, onSubmit }) => {
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
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  })

  useEffect(() => {
    if (ref) ref.current = {
      getData: () => validateFields(trigger, getValues(), formState.dirtyFields)
    }
  }, [formState.dirtyFields, getValues, ref, trigger]);

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      onSubmit && onSubmit()
    }} ref={ref} className={"form"}>
      <Input required={fieldsMeta.email.required} {...register("email", {
        onChange: () => clearErrors("email")
      })} error={errors.email?.message} label={"New email"} id={"email"}/>
      <Input required={fieldsMeta.confirmEmail.required} {...register("confirmEmail", {
        onChange: () => clearErrors("confirmEmail")
      })} error={errors.confirmEmail?.message} label={"Confirm new email"} id={"confirmEmail"}/>
      <Input type={"password"} required={fieldsMeta.password.required} {...register("password", {
        onChange: () => clearErrors("password")
      })} error={errors.password?.message} label={"Current password"} id={"password"}/>

      <Button type={"submit"} className={"hidden"} aria-hidden={"true"} tabIndex={-1}/>
    </form>
  )
}

export default ProfileEmailForm;