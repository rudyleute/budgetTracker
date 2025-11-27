import { Outlet } from "react-router-dom";
import Menu from "./components/Menu";

const Layout = () => {
  return (
    <div className={"lrg:grid-cols-[1fr_13fr_3fr] lrg:overflow-hidden lrg:h-screen lrg:grid lrg:w-screen " +
      "max-lrg:flex max-lrg:flex-col max-lrg:s-scroll max-lrg:s-scroll-track max-lrg:overflow-y-auto max-lrg:mt-[var(--menu-height)] max-lrg:h-[calc(100vh-var(--menu-height))]"}>
      <Menu/>
      <div className={"max-lrg:grow max-lrg:w-full mid:p-[15px_30px] max-mid:p-[15px_10px] max-sml:p-[15px_2px] bg-[var(--color-third)] lrg:s-scroll lrg:overflow-y-auto"}>
        <Outlet/>
      </div>
      <div className={"w-full h-fit bg-[var(--color-sec)] lrg:overflow-y-auto lrg:h-screen"}>
      </div>
    </div>
  );
}

export default Layout;