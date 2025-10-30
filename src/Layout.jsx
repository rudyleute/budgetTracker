import { Outlet } from "react-router-dom";
import Menu from "./components/Menu";

const Layout = () => {
  return (
    <div className={"flex justify-start"}>
      <Menu/>
      <div className={"m-b-color h-screen grow"}>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;