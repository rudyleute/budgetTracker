import { useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import api from '../services/axios.js';
import { toast } from 'react-toastify';
import { formToast } from '../helpers/toast.jsx';

const emptyObject = {}
const useAutocomplete = ({
                           defaultValue = '',
                           optionsEndpoint,
                           debounceDefault = 500,
                           onOptionClick,
                           optionLabelColumn = "name",
                           queryParams = emptyObject
                         } = {}) => {
  const [value, setValue] = useState(defaultValue);
  const [debouncedValue, setDebouncedValue] = useState(defaultValue)
  const [options, setOptions] = useState([]);

  const debouncedSetValue = useRef(
    _.debounce((newValue) => {
      setDebouncedValue(newValue);
    }, debounceDefault)
  ).current;

  const onValueChange = useCallback((newValue) => {
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
      const { data: newOptions, message } = await api.get(optionsEndpoint, { ...queryParams, filter: debouncedValue })

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

  const handleOptionClick = useCallback((elem) => {
    const newValue = elem[optionLabelColumn];
    setValue(newValue);
    setDebouncedValue(newValue);
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