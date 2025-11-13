import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/simple/Input.jsx';
import IconButton from '../components/simple/IconButton.jsx';
import { faRightToBracket, faIdBadge } from '@fortawesome/free-solid-svg-icons';
import { useAccount } from '../context/AccountProvider.jsx';

const SignUp = () => {
  const [data, setData] = useState({
    email: "",
    username: "",
    password: "",
    rPassword: ""
  });
  const navigate = useNavigate();
  const { signUp } = useAccount();

  return (
    <div className={"w-full h-screen comp-b-color relative"}>
      <div className={"w-[350px] flex flex-col gap-[10px] window-center relative t-b-color rounded-[15px] p-[15px_20px]"}>
        <Input lClassName={"!text-[1.1rem]"} wClassName={"!text-[1.1rem]"} onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
               value={data.email} type={"text"} label={"Email"}/>
        <Input lClassName={"!text-[1.1rem]"} wClassName={"!text-[1.1rem]"} onChange={(e) => setData(prev => ({ ...prev, username: e.target.value }))}
               value={data.username} type={"text"} label={"Username"}/>
        <Input lClassName={"!text-[1.1rem]"} wClassName={"!text-[1.1rem]"} onChange={(e) => setData(prev => ({ ...prev, password: e.target.value }))}
               value={data.password} type={"password"} label={"Password"}/>
        <Input lClassName={"!text-[1.1rem]"} wClassName={"!text-[1.1rem]"} onChange={(e) => setData(prev => ({ ...prev, rPassword: e.target.value }))}
               value={data.rPassword} type={"password"} label={"Repeat password"}/>
        <div className={"flex align-middle absolute right-0 pr-[20px] -translate-y-1/3"}>
          <IconButton title={"Log in"} iconClassName={"comp-color"} onClick={() => navigate("/login")}
                      icon={faIdBadge}/>
          <IconButton title={"Sign up"} iconClassName={"comp-color"} onClick={async () => await signUp(data)}
                      icon={faRightToBracket}/>
        </div>
      </div>
    </div>
  )
}


export default SignUp;