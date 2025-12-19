import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { counterpartyFormUtils } from '../../resolvers/counterpartyResolver.js';
import { validateFields } from '../../helpers/utils.js';
import Button from '../simple/Button.jsx';
import Input from '../simple/Input.jsx';
import Asterisk from '../simple/Asterisk.jsx';
import Textarea from '../simple/Textarea.jsx';

const CounterpartiesForm = ({ data = {}, ref, isUpdate = false, onSubmit }) => {
  const { resolver: counterpartyResolver, fieldsMeta } = useMemo(() => {
    return counterpartyFormUtils();
  }, []);

  const { name, phone, email, note } = data;

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
    clearErrors,
    formState,
  } = useForm({
    resolver: counterpartyResolver,
    defaultValues: {
      name: name || "",
      phone: phone || "",
      email: email || "",
      note: note || ""
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  });

  useEffect(() => {
    if (ref) ref.current = {
      getData: () => validateFields(trigger, getValues(), formState.dirtyFields)
    }
  }, [formState.dirtyFields, getValues, ref, trigger]);

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      onSubmit && onSubmit();
    }} className={"grid grid-cols-1 gap-2.5"}>
      <Input label={<>Name{fieldsMeta.name.required && <Asterisk/>}</>} id={"name"}
             type={"text"} {...register("name", {
        onChange: () => clearErrors("name")
      })} error={errors.name?.message}
      />
      <Input label={<>Phone{fieldsMeta.phone.required && <Asterisk/>}</>} id={"phone"}
             type={"text"} {...register("phone", {
        onChange: () => clearErrors("phone")
      })} error={errors.phone?.message}
      />
      <Input label={<>Email{fieldsMeta.email.required && <Asterisk/>}</>} id={"email"}
             type={"email"} {...register("email", {
        onChange: () => clearErrors("email")
      })} error={errors.email?.message}
      />
      <Textarea rows={5} className={"text-xl"} label={<>Note{fieldsMeta.note.required && <Asterisk/>}</>} id={"note"}
             {...register("note", {
        onChange: () => clearErrors("note")
      })} error={errors.note?.message}
      />
      <Button type={"submit"} className={"hidden"} aria-hidden={"true"} tabIndex={-1}/>
    </form>
  );
}

export default CounterpartiesForm;