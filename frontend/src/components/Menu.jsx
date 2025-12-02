import {
  faHouse,
  faChartPie,
  faRightFromBracket,
  faCircleUser,
  faCoins, faUserGroup
} from '@fortawesome/free-solid-svg-icons';
import IconButton from './simple/IconButton.jsx';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountProvider.jsx';

const Menu = () => {
  const navigate = useNavigate();
  const { logOut } = useAccount();

  return (
    <aside
      className={"flex items-center justify-between bg-[var(--color-sec)] h-full w-full shadow-sm " +
        "lrg:flex-col lrg:p-[15px_15px] " +
        "max-lrg:p-[10px_25px] max-esml:p-[10px_4px] max-lrg:fixed max-lrg:top-0 max-lrg:left-0 max-lrg:h-[var(--menu-height)] max-lrg:z-[1000]"}>
      <div className={"flex lrg:flex-col gap-[15px] max-esml:gap-[5px] items-center w-full"}>
        <IconButton onClick={() => navigate("/")} title={"Home"} icon={faHouse}
                    iconClassName={"max-lrg:icon-s lrg:icon-b"}/>
        <IconButton onClick={() => navigate("/dashboard")} title={"Dashboard"} icon={faChartPie}
                    iconClassName={"max-lrg:icon-s lrg:icon-b"}/>
        <IconButton onClick={() => navigate("/loans")} title={"Loans"} icon={faCoins}
                    iconClassName={"max-lrg:icon-s lrg:icon-b"}/>
        <IconButton onClick={() => navigate("/counterparties")} title={"Counterparties"} icon={faUserGroup}
                    iconClassName={"max-lrg:icon-s lrg:icon-b"}/>
      </div>

      <div className={"flex justify-center gap-[5px] lrg:gap-[10px]"}>
        <IconButton onClick={() => navigate("/profile")} title={"Profile"} icon={faCircleUser}
                    iconClassName={"icon-s"}/>
        <IconButton onClick={() => logOut()} title={"Log out"} icon={faRightFromBracket}
                    iconClassName={"icon-s"}/>
      </div>
    </aside>
  )
}

export default Menu;