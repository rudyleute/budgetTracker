import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { loanFormUtils } from '../../resolvers/loanResolver.js';
import { validateFields } from '../../helpers/utils.js';
import { getDatetimeLocal } from '../../helpers/time.js';
import Select from '../simple/Select.jsx';
import Button from '../simple/Button.jsx';
import { useLoans } from '../../context/LoansProvider.jsx';
import Input from '../simple/Input.jsx';
import useAutocomplete from '../../hooks/useAutocomplete.jsx';
import Autocomplete from '../simple/Autocomplete.jsx';

const Asterisk = () => <span title={"Required"} className={"text-[var(--color-third)]"}>*</span>

const LoansForm = ({ data = {}, ref, isUpdate = false, onSubmit }) => {
  const { priorities, types } = useLoans();
  const { resolver: loanResolver, fieldsMeta } = useMemo(() => {
    return loanFormUtils(types, priorities);
  }, [types, priorities]);

  const { name, sum, timestamp, deadline, counterparty, type, priority } = data;

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
    resolver: loanResolver,
    defaultValues: {
      name: name || "",
      sum: sum || "",
      timestamp: "",
      deadline: undefined,
      counterpartyId: counterparty?.id || "",
      type: type || "",
      priority: priority || undefined
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  });

  const onOptionClick = useCallback(
    (item) => setValue("counterpartyId", item.id, {
      shouldValidate: true, shouldDirty: true
    }),
    [setValue]
  );

  const { resetValue, ...restAutocompleteProps } = useAutocomplete({
    optionsEndpoint: "/counterparties",
    onOptionClick,
    ...(isUpdate && { defaultValue: counterparty?.name })
  })

  const fields = watch();

  useEffect(() => {
    if (ref) ref.current = {
      getData: () => validateFields(trigger, getValues(), formState.dirtyFields)
    }
  }, [formState.dirtyFields, getValues, ref, trigger]);

  useEffect(() => {
    //The timestamp should be dirtied up before when creating a new transaction since the default value is generated
    if (isUpdate) {
      setValue("timestamp", getDatetimeLocal(new Date(timestamp)));
      if (deadline) setValue("deadline", getDatetimeLocal(new Date(deadline)));
    } else setValue("timestamp", getDatetimeLocal(new Date(Date.now())), { shouldDirty: true });
  }, [setValue, isUpdate, timestamp, deadline]);

  const priorityOptions = useMemo(
    () => priorities.filter(priority => priority !== fields.priority).map(priority => ({ label: priority })),
    [fields.priority, priorities]
  );
  const typeOptions = useMemo(
    () => types.filter(type => type !== fields.type).map(type => ({ label: type })),
    [fields.type, types]
  );

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      if (onSubmit) {
        const data = await validateFields(trigger, getValues(), formState.dirtyFields);

        if (data) onSubmit(data);
      }
    }} className={"grid max-modal:grid-cols-1 modal:grid-cols-[2fr_1fr] gap-[10px]"}>
      <Input wClassName={"col-span-full"} label={<>Name{fieldsMeta.name.required && <Asterisk/>}</>} id={"name"}
             type={"text"} {...register("name", {
        onChange: () => clearErrors("name")
      })} error={errors.name?.message}
      />
      <Input label={<>Timestamp{fieldsMeta.timestamp.required && <Asterisk/>}</>} id={"timestamp"}
             type={"datetime-local"} {...register("timestamp", {
        onChange: () => clearErrors("timestamp")
      })} error={errors.timestamp?.message}
      />
      <Input label={<>Sum{fieldsMeta.sum.required && <Asterisk/>}</>} id={"sum"} type={"number"} min={0}
             step={0.01} {...register("sum", {
        onChange: () => clearErrors("sum")
      })} error={errors.sum?.message}
      />
      <Autocomplete
        {...restAutocompleteProps}
        id={"counterparty"}
        label={<>Counterparty{fieldsMeta.counterpartyId.required && <Asterisk/>}</>}
        className={"col-span-full"}
        placeholder={"Search for counterparty..."}
        error={errors.counterpartyId?.message}
      />
      <Input label={<>Deadline{fieldsMeta.deadline.required && <Asterisk/>}</>} id={"deadline"}
             type={"datetime-local"} {...register("deadline", {
        onChange: () => clearErrors("deadline")
      })} error={errors.deadline?.message}
      />

      <Select
        className={"col-span-full"}
        value={fields.type || "--Select type--"}
        lClassName={"flex items-center"}
        label={<>Type{fieldsMeta.type.required && <Asterisk/>}</>}
        onOptionClick={({ label }) => setValue("type", label, {
          shouldValidate: true, shouldDirty: true
        })}
        options={typeOptions}
        error={errors.type?.message}
      />
      <Select
        className={"col-span-full"}
        value={fields.priority || "--Select priority--"}
        lClassName={"flex items-center"}
        label={<>
          Priority{fieldsMeta.priority.required && <Asterisk/>}
        </>}
        onOptionClick={({ label }) => setValue("priority", label, {
          shouldValidate: true, shouldDirty: true
        })}
        options={priorityOptions}
        error={errors.priority?.message}
      />
      <Button type={"submit"} className={"hidden"} aria-hidden={"true"} tabIndex={-1}/>
    </form>
  );
}

export default LoansForm;