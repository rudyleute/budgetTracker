import { Outlet } from "react-router-dom";
import Menu from "./components/Menu";
import Modal from './components/simple/Modal.jsx';
import { ModalProvider } from './context/ModalProvider.jsx';

const Layout = () => {
  return (
    <div className={"flex justify-start"}>
      <ModalProvider>
        <Menu/>
        <div className={"grid grid-cols-[9fr_2fr] m-b-color h-screen grow"}>
          <div className={"s-scroll p-[30px] overflow-y-auto"}>
            <Outlet/>
          </div>
          <div className={"w-full h-full overflow-y-auto comp-b-color"}>
          </div>
        </div>
      </ModalProvider>
    </div>
  );
}

export default Layout;