import {
  faHouse,
  faChartPie,
  faRightFromBracket,
  faCircleUser,
  faCoins, faPeopleArrows
} from '@fortawesome/free-solid-svg-icons';
import IconButton from './simple/IconButton.jsx';
import { useAccount } from '../context/AccountProvider.jsx';
import LinkIcon from './simple/LinkIcon.jsx';

const MenuLink = ({ to, title, icon }) => <LinkIcon to={to} title={title} icon={icon} iClassName={"max-lrg:icon-s lrg:icon-b"} />

const Menu = () => {
  const { logOut } = useAccount();

  return (
    <aside
      className={"flex items-center justify-between bg-(--color-sec) h-full w-full shadow-sm " +
        "lrg:flex-col lrg:p-[15px_15px] " +
        "max-lrg:p-[10px_25px] max-esml:p-[10px_4px] max-lrg:fixed max-lrg:top-0 max-lrg:left-0 max-lrg:h-(--menu-height) max-lrg:z-1000"}>
      <div className={"flex lrg:flex-col gap-[15px] max-esml:gap-[5px] items-center w-full"}>
        <MenuLink to={'/'} title={"Home"} icon={faHouse} />
        {/*<MenuLink to={'/dashboard'} title={"Dashboard"} icon={faChartPie} />*/}

        <MenuLink to={"/loans"} title={"Loans"} icon={faCoins} />
        <MenuLink to={'/counterparties'} title={"Counterparties"} icon={faPeopleArrows} />
      </div>

      <div className={"flex justify-center gap-[5px] lrg:gap-2.5"}>
        {/*<MenuLink to={"/profile"} title={"Profile"} icon={faCircleUser} />*/}
        <IconButton onClick={() => logOut()} title={"Log out"} icon={faRightFromBracket}
                    iconClassName={"icon-s"}/>
      </div>
    </aside>
  )
}

export default Menu;