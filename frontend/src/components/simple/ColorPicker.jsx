import { HuePicker } from 'react-color';
import Color from './Color.jsx';
import { twMerge } from 'tailwind-merge';
import React from 'react';


const ColorPicker = ({value, onChange, error, className}) => {
  return (
    <div>
      <label className={"label"}>Color</label>
      <div className={twMerge("p-[10px] rounded-[10px] bg-[var(--color-third)]/30 shadow-md flex justify-between items-center", className)}>
        <Color className={"w-[25px]"} value={value}/>
        <HuePicker width={"90%"} color={value}
                   onChange={(newColor) => onChange(newColor?.hex)}/>
      </div>
      {error && <span className={"max-modal:text-xl modal:text-xs text-[var(--color-error)]"}>{error}</span>}
    </div>
  )
}

export default ColorPicker;