import {validateFields} from "../helpers/utils";
import {FormRef} from "../types/basic";
import {UseFormReturn} from "react-hook-form";
import {ForwardedRef, useImperativeHandle} from "react";

export const useFormRef = (ref: ForwardedRef<FormRef>, form: UseFormReturn) => {
    useImperativeHandle(ref, (): FormRef => ({
        getData: () => validateFields(form.trigger, form.getValues(), form.formState.dirtyFields)
    }));
};