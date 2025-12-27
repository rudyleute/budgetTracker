import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { loanFormUtils } from '../../resolvers/loanResolver.js';
import { validateFields } from '../../helpers/utils.js';
import { getDatetimeLocal } from '../../helpers/time.js';
import Select from '../simple/Select.jsx';
import Button from '../simple/Button.jsx';
import { useLoans } from '../../context/LoansProvider.jsx';
import Input from '../simple/Input.jsx';
import useAutocomplete from '../../hooks/useAutocomplete.js';
import Autocomplete from '../simple/Autocomplete.jsx';

const LoansForm = ({ data = {}, ref, isUpdate = false, onSubmit, counterparty }) => {
  const { priorities, types } = useLoans();
  const { resolver: loanResolver, fieldsMeta } = useMemo(() => {
    return loanFormUtils(types, priorities);
  }, [types, priorities]);

  const { name, sum, timestamp, deadline, counterparty: loanCounterparty, type, priority } = data;

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
      deadline: "",
      counterpartyId: loanCounterparty?.id || "",
      type: type || "",
      priority: priority || undefined
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  });

  const onOptionClick = useCallback(
    (item) => setValue("counterpartyId", item.id, { shouldDirty: true }),
    [setValue]
  );

  const { resetValue, ...restAutocompleteProps } = useAutocomplete({
    optionsEndpoint: "/counterparties",
    onOptionClick,
    ...(!isUpdate && counterparty?.name && { defaultValue: counterparty?.name }),
    ...(isUpdate && { defaultValue: loanCounterparty?.name })
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

    //default counterparty should be marked as dirtied up
    if (!isUpdate && counterparty?.id) {
      setValue("counterpartyId", counterparty.id, { shouldDirty: true })
    }
  }, [setValue, isUpdate, timestamp, deadline, counterparty]);

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
      onSubmit && onSubmit()
    }} className={"grid max-modal:grid-cols-1 modal:grid-cols-[2fr_1fr] gap-2.5"}>
      <Input required={fieldsMeta.name.required} wClassName={"col-span-full"} label={<>Name</>} id={"name"}
             type={"text"} {...register("name", {
        onChange: () => clearErrors("name")
      })} error={errors.name?.message}
      />
      <Input required={fieldsMeta.timestamp.required} label={<>Timestamp</>} id={"timestamp"}
             type={"datetime-local"} {...register("timestamp", {
        onChange: () => clearErrors("timestamp")
      })} error={errors.timestamp?.message}
      />
      <Input required={fieldsMeta.sum.required} label={<>Sum</>} id={"sum"} type={"number"} min={0}
             step={0.01} {...register("sum", {
        onChange: () => clearErrors("sum")
      })} error={errors.sum?.message}
      />
      <Autocomplete
        {...restAutocompleteProps}
        id={"counterparty"}
        required={fieldsMeta.counterpartyId.required}
        label={<>Counterparty</>}
        className={"col-span-full"}
        placeholder={"Search for counterparty..."}
        error={errors.counterpartyId?.message}
      />
      <Input required={fieldsMeta.deadline.required} wClassName={"col-span-full"} label={<>Deadline</>} id={"deadline"}
             type={"datetime-local"} {...register("deadline", {
        onChange: () => clearErrors("deadline")
      })} error={errors.deadline?.message}
      />

      <Select
        className={"col-span-full"}
        value={fields.type || "--Select type--"}
        lClassName={"flex items-center"}
        required={fieldsMeta.type.required}
        label={<>Type</>}
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
        required={fieldsMeta.priority.required}
        label={<>Priority</>}
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