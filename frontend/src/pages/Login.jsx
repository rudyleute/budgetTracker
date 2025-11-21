import Input from '../components/simple/Input.jsx';
import { useState } from 'react';
import { faRightToBracket, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../components/simple/IconButton.jsx';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountProvider.jsx';

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate();
  const { logIn } = useAccount();

  return (
    <div className={"w-full h-screen bg-[var(--color-sec)] relative"}>
      <div
        className={"w-[350px] flex flex-col gap-[10px] window-center relative bg-[var(--color-main)] rounded-[15px] p-[15px_20px]"}>
        <Input lClassName={"!text-[1.1rem]"} wClassName={"!text-[1.1rem]"}
               onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))} value={data.email} type={"text"}
               label={"Email"}/>
        <Input lClassName={"!text-[1.1rem]"} wClassName={"!text-[1.1rem]"}
               onChange={(e) => setData(prev => ({ ...prev, password: e.target.value }))} value={data.password}
               type={"password"} label={"Password"}/>
        <div className={"flex items-center gap-[2px] absolute right-0 pr-[20px] -translate-y-1/3"}>
          <IconButton title={"Sign up"} iconClassName={"text-[var(--color-sec)]"} onClick={() => navigate("/signup")}
                      icon={faCircleUser}/>
          <IconButton title={"Log in"} iconClassName={"text-[var(--color-sec)]"} onClick={() => logIn(data)} icon={faRightToBracket}/>
        </div>
      </div>
    </div>
  )
}

export default Login;