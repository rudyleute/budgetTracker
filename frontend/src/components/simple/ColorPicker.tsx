import {ColorResult, HuePicker} from 'react-color';
import Color from './Color';
import { twMerge } from 'tailwind-merge';
import Asterisk from './Asterisk';
import {AnyFieldError} from "../../types/basic";

interface ColorPickerProps {
    value: string;
    error?: AnyFieldError;
    required?: boolean;
    className?: string;
    onChange: (value: ColorResult['hex']) => unknown;
}

const ColorPicker = ({value, onChange, error, required = false, className}: ColorPickerProps) => {
    const errorMessage = typeof error?.message === 'string' ? error.message : undefined;

    return (
        <div>
            <label className={"label"}>Color{required && <Asterisk />}</label>
            <div className={twMerge("p-2.5 rounded-[10px] bg-(--color-third)/30 shadow-md flex justify-between items-center", className)}>
                <Color className={"w-[25px]"} value={value}/>
                <HuePicker width={"90%"} color={value}
                           onChange={(newColor) => onChange(newColor?.hex)}/>
            </div>
            {errorMessage && <span className={"max-modal:text-xl modal:text-xs text-(--color-error)"}>{errorMessage}</span>}
        </div>
    )
}

export default ColorPicker;