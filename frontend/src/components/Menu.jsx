import { faHouse, faChartPie, faRightFromBracket, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import IconButton from './simple/IconButton.jsx';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountProvider.jsx';

const Menu = () => {
  const navigate = useNavigate();
  const { logOut } = useAccount();

  return (
    <aside
      className={"flex items-center justify-between bg-[var(--color-sec)] h-full w-full shadow-sm " +
        "mid:flex-col mid:p-[15px_15px] " +
        "max-mid:p-[10px_25px] max-mid:fixed max-mid:top-0 max-mid:left-0 max-mid:h-[var(--menu-height)] max-mid:z-[1000]"}>
      <div className={"flex mid:flex-col gap-[15px] items-center w-full"}>
        <IconButton onClick={() => navigate("/")} title={"Home"} icon={faHouse} iconClassName={"icon-b"}/>
        <IconButton onClick={() => navigate("/dashboard")} title={"Dashboard"} icon={faChartPie}
                    iconClassName={"icon-b"}/>
      </div>

      <div className={"flex max-mid:flex-col justify-center gap-[5px] mid:gap-[10px]"}>
        <IconButton onClick={() => navigate("/profile")} title={"Profile"} icon={faCircleUser}
                    iconClassName={"icon-s"}/>
        <IconButton onClick={() => logOut()} title={"Log out"} icon={faRightFromBracket}
                    iconClassName={"icon-s"}/>
      </div>
    </aside>
  )
}

export default Menu;