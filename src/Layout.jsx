import { Outlet } from "react-router-dom";
import Menu from "./components/Menu";

const Layout = () => {
  return (
    <div className={"flex justify-start font-[Quicksand] text-2xl"}>
      <Menu/>
      <div className={"m-b-color h-screen grow p-[30px] overflow-y-auto"}>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;