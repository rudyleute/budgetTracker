import {forwardRef, useCallback, useEffect, useMemo} from 'react';
import { useForm } from 'react-hook-form';
import {loanFormUtils, LoanSchemaType} from '../../resolvers/loanResolver';
import { getDatetimeLocal } from '../../helpers/time';
import Select, {SelectOption} from '../simple/Select';
import Button from '../simple/Button';
import { useLoans } from '../../context/LoansProvider';
import Input from '../simple/Input';
import useAutocomplete from '../../hooks/useAutocomplete';
import Autocomplete from '../simple/Autocomplete';
import { CounterpartiesRequestQuery } from '@app/shared';
import {CounterpartyGetClient, PagEntityGet} from "../../types/components/mappings";
import {FormRef} from "../../types/basic";
import {useFormRef} from "../../hooks/useFormRef";

interface LoansFormProps {
    data?: PagEntityGet<'loan'>,
    isUpdate?: boolean,
    onSubmit?: () => unknown,
    counterparty?: CounterpartyGetClient
}
const LoansForm = forwardRef<FormRef, LoansFormProps>(({ data = {} as NonNullable<LoansFormProps['data']>, isUpdate = false, onSubmit, counterparty }, ref) => {
    const { priorities, types } = useLoans();
    const { resolver: loanResolver, fieldsMeta } = useMemo(() => {
        return loanFormUtils(types, priorities);
    }, [types, priorities]);

    const { name, sum, timestamp, deadline, counterparty: loanCounterparty, type, priority } = data;

    const form = useForm({
        resolver: loanResolver,
        defaultValues: {
            name: name || "",
            sum: sum || "",
            timestamp: "",
            deadline: "",
            counterpartyId: loanCounterparty?.id || "",
            type: type || "",
            priority: priority || undefined
        } satisfies Record<keyof LoanSchemaType, unknown>,
        mode: "onSubmit",
        reValidateMode: "onSubmit"
    });

    const {
        register,
        formState: { errors },
        setValue,
        clearErrors,
        watch
    } = form;

    useFormRef(ref, form);

    const onOptionClick = useCallback(
        (item: CounterpartyGetClient) => setValue("counterpartyId", item.id, { shouldDirty: true, shouldValidate: true }),
        [setValue]
    );

    const { resetValue, ...restAutocompleteProps } = useAutocomplete<'counterparty', CounterpartiesRequestQuery>({
        optionsEndpoint: "/counterparties",
        onOptionClick,
        ...(!isUpdate && counterparty?.name && { defaultValue: counterparty?.name }),
        ...(isUpdate && { defaultValue: loanCounterparty?.name })
    })

    const fields = watch();

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

    const priorityOptions: SelectOption[] = useMemo(
        () => priorities.filter(priority => priority !== fields.priority).map((priority, ind) => ({ label: priority, id: String(ind) })),
        [fields.priority, priorities]
    );
    const typeOptions: SelectOption[] = useMemo(
        () => types.filter(type => type !== fields.type).map((type, ind) => ({ label: type, id: String(ind) })),
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
            })} error={errors.name}
            />
            <Input required={fieldsMeta.timestamp.required} label={<>Timestamp</>} id={"timestamp"}
                   type={"datetime-local"} {...register("timestamp", {
                onChange: () => clearErrors("timestamp")
            })} error={errors.timestamp}
            />
            <Input required={fieldsMeta.sum.required} label={<>Sum</>} id={"sum"} type={"number"} min={0}
                   step={0.01} {...register("sum", {
                onChange: () => clearErrors("sum")
            })} error={errors.sum}
            />
            <Autocomplete<'counterparty', CounterpartiesRequestQuery>
                {...restAutocompleteProps}
                id={"counterparty"}
                required={fieldsMeta.counterpartyId.required}
                label={<>Counterparty</>}
                className={"col-span-full"}
                placeholder={"Search for counterparty..."}
                error={errors.counterpartyId}
            />
            <Input required={fieldsMeta.deadline.required} wClassName={"col-span-full"} label={<>Deadline</>} id={"deadline"}
                   type={"datetime-local"} {...register("deadline", {
                onChange: () => clearErrors("deadline")
            })} error={errors.deadline}
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
                error={errors.type}
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
                error={errors.priority}
            />
            <Button type={"submit"} className={"hidden"} aria-hidden={"true"} tabIndex={-1}/>
        </form>
    );
})

export default LoansForm;