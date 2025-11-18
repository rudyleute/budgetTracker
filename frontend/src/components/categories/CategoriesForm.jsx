import { useEffect, useState } from 'react';
import { HuePicker } from 'react-color';
import Input from '../simple/Input.jsx';
import Color from '../simple/Color.jsx';

const CategoriesForm = ({ ref, color, name }) => {
  const [data, setData] = useState({
    color: color || "#1100ff",
    name: name || ""
  });

  useEffect(() => {
    if (ref) ref.current = { getData: () => data }
  }, [ref, data]);

  return (
    <div ref={ref} className={"form"}>
      <Input label={"name"} value={data.name} onChange={(e) => setData(prev => ({ ...prev, "name": e.target.value }))}/>
      <div>
        <label className={"label"}>Color</label>
        <div className={"p-[10px] rounded-[10px] bg-black/60 shadow-md flex justify-between items-center"}>
          <Color className={"w-[25px]"} value={data.color}/>
          <HuePicker width={"90%"} color={data.color} onChange={(newColor) => setData(prev => ({ ...prev, color: newColor?.hex }))}/>
        </div>
      </div>
    </div>
  )
}

export default CategoriesForm;