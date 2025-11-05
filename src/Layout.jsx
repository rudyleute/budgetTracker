import { Outlet } from "react-router-dom";
import Menu from "./components/Menu";
import { ModalProvider } from './context/ModalProvider.jsx';
import { CategoriesProvider } from './context/CategoriesProvider.jsx';

const Layout = () => {
  return (
    <div className={"flex justify-start"}>
      <CategoriesProvider>
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
      </CategoriesProvider>
    </div>
  );
}

export default Layout;