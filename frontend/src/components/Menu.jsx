import { faHouse, faChartPie, faRightFromBracket, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import IconButton from './simple/IconButton.jsx';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountProvider.jsx';

const Menu = () => {
  const navigate = useNavigate();
  const { logOut } = useAccount();

  return (
    <aside
      className={"flex flex-col justify-between bg-[var(--color-comp)] min-w-[100px] max-w-[130px] w-[10vw] h-screen shadow-sm pt-[15px] pb-[10px]"}>
      <div className={"flex flex-col gap-[15px] items-center w-full"}>
        <IconButton onClick={() => navigate("/")} title={"Home"} icon={faHouse} iconClassName={"icon-b"}/>
        <IconButton onClick={() => navigate("/dashboard")} title={"Dashboard"} icon={faChartPie}
                    iconClassName={"icon-b"}/>
      </div>

      <div className={"flex justify-center gap-[10px]"}>
        <IconButton onClick={() => navigate("/profile")} title={"Profile"} icon={faCircleUser}
                    iconClassName={"icon-s"}/>
        <IconButton onClick={() => logOut()} title={"Log out"} icon={faRightFromBracket}
                    iconClassName={"icon-s"}/>
      </div>
    </aside>
  )
}

export default Menu;