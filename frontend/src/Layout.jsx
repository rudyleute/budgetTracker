import { Outlet } from "react-router-dom";
import Menu from "./components/Menu";

const Layout = () => {
  return (
    <div className={"flex justify-start"}>
      <Menu/>
      <div className={"grid grid-cols-[9fr_2fr] bg-[var(--color-main)] h-screen grow"}>
        <div className={"s-scroll p-[30px] overflow-y-auto"}>
          <Outlet/>
        </div>
        <div className={"w-full h-full overflow-y-auto bg-[var(--color-comp)]"}>
        </div>
      </div>
    </div>
  );
}

export default Layout;