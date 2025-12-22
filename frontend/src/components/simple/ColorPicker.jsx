import { HuePicker } from 'react-color';
import Color from './Color.jsx';
import { twMerge } from 'tailwind-merge';
import React from 'react';
import Asterisk from './Asterisk.jsx';


const ColorPicker = ({value, onChange, error, required, className}) => {
  return (
    <div>
      <label className={"label"}>Color{required && <Asterisk />}</label>
      <div className={twMerge("p-2.5 rounded-[10px] bg-(--color-third)/30 shadow-md flex justify-between items-center", className)}>
        <Color className={"w-[25px]"} value={value}/>
        <HuePicker width={"90%"} color={value}
                   onChange={(newColor) => onChange(newColor?.hex)}/>
      </div>
      {error && <span className={"max-modal:text-xl modal:text-xs text-(--color-error)"}>{error}</span>}
    </div>
  )
}

export default ColorPicker;