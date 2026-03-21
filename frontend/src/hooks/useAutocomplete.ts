import { useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import api from '../services/axios';
import { toast } from 'react-toastify';
import { formToast } from '../helpers/toast';
import {RequestQueryType} from "../types/basic";
import {PagEntityGet, PagEntityName} from "../types/components/mappings";

const emptyObject: Readonly<RequestQueryType> = {}

type OnOptionClick <E extends PagEntityName> = (elem: PagEntityGet<E>) => void;
type LabelColumn <E extends PagEntityName> = keyof PagEntityGet<E>;
export interface AutocompleteProps<E extends PagEntityName, T extends RequestQueryType> {
    defaultValue?: string;
    debounceDefault?: number,
    optionLabelColumn?: LabelColumn<E>,
    queryParams?: T,
    optionsEndpoint: string,
    onOptionClick: OnOptionClick<E>
}

const useAutocomplete = <E extends PagEntityName, T extends RequestQueryType>({
                             defaultValue = '',
                             optionsEndpoint,
                             debounceDefault = 500,
                             onOptionClick,
                             optionLabelColumn = "name",
                             queryParams = emptyObject as T
                         }: AutocompleteProps<E, T>) => {
    const [value, setValue] = useState(defaultValue);
    const [debouncedValue, setDebouncedValue] = useState(defaultValue)
    const [options, setOptions] = useState<PagEntityGet<E>[]>([]);

    const debouncedSetValue = useRef(
        _.debounce((newValue) => {
            setDebouncedValue(newValue);
        }, debounceDefault)
    ).current;

    const onValueChange = useCallback((newValue: string) => {
        setValue(newValue);
        debouncedSetValue(newValue);
    }, [debouncedSetValue]);

    const resetValue = useCallback(() => {
        setValue(defaultValue);
        setDebouncedValue(defaultValue);
        debouncedSetValue.cancel(); //skip debounce as it should be updated immediately
    }, [debouncedSetValue, defaultValue])

    useEffect(() => {
        (async () => {
            const { data: newOptions, message } = await api.getPaginated<PagEntityGet<E>>(optionsEndpoint, { ...queryParams, filter: debouncedValue })

            if (!newOptions) {
                toast.error(formToast(message));
                return;
            }

            setOptions(newOptions.data);
        })();
    }, [debouncedValue, optionsEndpoint, queryParams]);

    //clean up on unmount
    useEffect(() => {
        return () => debouncedSetValue.cancel();
    }, [debouncedSetValue]);

    const handleOptionClick = useCallback((elem: PagEntityGet<E>) => {
        const newValue = elem[optionLabelColumn];
        setValue(newValue as string);
        setDebouncedValue(newValue as string);
        debouncedSetValue.cancel(); //skip debounce as it should be updated immediately
        onOptionClick && onOptionClick(elem);
    }, [debouncedSetValue, onOptionClick, optionLabelColumn]);

    return {
        value,
        options,
        onChange: onValueChange,
        onOptionClick: handleOptionClick,
        optionLabelColumn,
        resetValue
    }
}

export default useAutocomplete;