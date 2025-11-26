import { Outlet } from "react-router-dom";
import Menu from "./components/Menu";

const Layout = () => {
  return (
    <div className={"grid max-mid:s-scroll max-mid:s-scroll-track max-mid:overflow-y-auto max-mid:mt-[var(--menu-height)] mid:grid-cols-[1fr_13fr_3fr] justify-start mid:overflow-hidden h-screen"}>
      <Menu/>
      <div className={"p-[30px] bg-[var(--color-third)] mid:s-scroll mid:overflow-y-auto"}>
        <Outlet/>
      </div>
      <div className={"w-full h-fit min-h-[200px] bg-[var(--color-sec)] mid:overflow-y-auto mid:h-full"}>
      </div>
    </div>
  );
}

export default Layout;