import Input from '../components/simple/Input.jsx';
import { faRightToBracket, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../components/simple/IconButton.jsx';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountProvider.jsx';
import { loginFormUtils } from '../resolvers/loginResolver.js';
import { useForm } from 'react-hook-form';
import { useMemo } from 'react';

const LoginPage = () => {
  const { resolver: loginResolver } = useMemo(() => {
    return loginFormUtils();
  }, []);

  const {
    register,
    formState: { errors },
    clearErrors,
    handleSubmit
  } = useForm({
    resolver: loginResolver,
    defaultValues: {
      email: "",
      password: ""
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const navigate = useNavigate();
  const { logIn } = useAccount();

  return (
    <div onSubmit={handleSubmit((values) => logIn(values))} className={"w-full h-screen bg-(--color-sec) relative"}>
      <form
        className={"w-[350px] max-esml:w-[95%] flex flex-col window-center gap-[15px] relative bg-(--color-main) rounded-[15px] p-[20px_20px_35px_20px]"}
      >
        <div className={"flex items-center justify-between"}>
          <IconButton size={"xl"} title={"Sign up"} iconClassName={"text-(--color-sec)"}
                      onClick={() => navigate("/signup")}
                      icon={faCircleUser}/>
          <span className={"inline-block text-(--color-text) uppercase font-bold"}>
            Sign in
          </span>
          <IconButton type={"submit"} size={"xl"} title={"Sign in"} iconClassName={"text-(--color-sec)"}
                      icon={faRightToBracket}
          />
        </div>
        <div className={"flex flex-col gap-2.5"}>
          <Input error={errors.email?.message} {...register("email", {
            onChange: () => clearErrors("email")
          })} lClassName={"!text-[1.1rem]"} wClassName={"!text-[1.1rem]"} type={"text"}
                 label={"Email"} id={"email"} autoComplete={"true"}
          />
          <Input error={errors.password?.message} lClassName={"!text-[1.1rem]"}
                 wClassName={"!text-[1.1rem]"}  {...register("password", {
            onChange: () => clearErrors("password")
          })} type={"password"} label={"Password"} id={"password"}
          />
        </div>
      </form>
    </div>
  )
}

export default LoginPage;