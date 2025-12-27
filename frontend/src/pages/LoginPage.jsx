import Input from '../components/simple/Input.jsx';
import { faRightToBracket, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../components/simple/IconButton.jsx';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountProvider.jsx';
import { loginFormUtils } from '../resolvers/loginResolver.js';
import { useForm } from 'react-hook-form';
import { useMemo } from 'react';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

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
  const { logIn, signInWithGoogle } = useAccount();

  return (
    <div onSubmit={handleSubmit((values) => logIn(values))} className={"w-full h-screen bg-(--color-sec) relative"}>
      <form
        className={"w-[350px] max-esml:w-[95%] flex flex-col window-center gap-[15px] relative bg-(--color-main) rounded-[15px] p-[20px_20px_35px_20px]"}
      >
        <div className={"grid grid-cols-[2fr_4fr_2fr] gap-[5px] items-center"}>
          <div className={"w-fit"}>
            <IconButton className={"mr-1"} title={"Sign up"} iconClassName={"text-(--color-third)"}
                      onClick={() => navigate("/signup")}
                      icon={faUserCircle}/>
            <IconButton title={"Sign in with google"} iconClassName={"text-(--color-third)"}
                        onClick={signInWithGoogle}
                        icon={faGoogle}/>
          </div>
          <span className={"justify-self-center text-(--color-text) uppercase font-bold"}>
            Sign in
          </span>
          <IconButton className={"justify-self-end"} type={"submit"} title={"Sign in"} iconClassName={"text-(--color-third)"}
                      icon={faRightToBracket}
          />
        </div>
        <div className={"flex flex-col gap-2.5"}>
          <Input autoComplete={"email"} error={errors.email?.message} {...register("email", {
            onChange: () => clearErrors("email")
          })} lClassName={"!text-[1.1rem]"} wClassName={"!text-[1.1rem]"} type={"text"}
                 label={"Email"} id={"email"}
          />
          <Input autoComplete={"current-password"} error={errors.password?.message} lClassName={"!text-[1.1rem]"}
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