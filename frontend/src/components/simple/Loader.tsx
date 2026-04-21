import { createPortal } from 'react-dom';
import { GridLoader } from 'react-spinners';
import {UseLoader} from "../../hooks/useLoader";

type LoaderProps = Omit<UseLoader, 'isLoading' | 'overlayColor'> & {
    message?: string,
}
const Loader = ({ message, size = 30, color = "var(--color-sec)", LoaderComp = GridLoader, global = true }: LoaderProps) => {
    return global ? createPortal(<div
            className={"fixed gap-[15px] overlay z-4000 flex flex-col justify-center items-center"}>
            <LoaderComp size={size} color={color}/>
            {message && <span className={"text-(--color-main) font-bold"}>{message}</span>}
        </div>, document.body) :
        <LoaderComp size={size} color={color}/>;
}

export default Loader;