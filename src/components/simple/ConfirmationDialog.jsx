import { createPortal } from 'react-dom';
import Button from './Button.jsx';

const ConfirmationDialog = ({ onReject, onAccept, text }) => {
  return createPortal(
    <div className={"z-[3000] w-[400px] h-[250px] window-center rounded-[15px] flex flex-col text-white font-bold"}>
      <div className={"t-b-color h-[80%] p-[10px_15px]"}>
        <span>Are you sure that you want to delete {text}</span>
      </div>
      <div className={"bg-[#901636] grow flex justify-around items-center gap-[10px] p-[7px_10px]"}>
        <Button className={"w-[50%] btn-classic jump-05 t-b-color"} onClick={onReject}>Cancel</Button>
        <Button className={"w-[50%] btn-classic jump-05 comp-b-color"} onClick={onAccept}>Confirm</Button>
      </div>
    </div>, document.body);
}

export default ConfirmationDialog;