import { useEffect, useState } from 'react';
import { SliderPicker } from 'react-color';
import Input from '../simple/Input.jsx';

const CategoriesForm = ({ ref, color, name }) => {
  const [data, setData] = useState({
    color: color || {},
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
        <div className={"p-[10px] rounded-[10px] bg-black/20 shadow-md"}>
          <SliderPicker color={data.color} onChange={(newColor) => setData(prev => ({ ...prev, color: newColor?.hex }))}/>
        </div>
      </div>
    </div>
  )
}

export default CategoriesForm;