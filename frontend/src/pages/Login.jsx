import Input from '../components/simple/Input.jsx';
import { faRightToBracket, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../components/simple/IconButton.jsx';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountProvider.jsx';
import { loginResolver } from '../schemas/loginSchema.js';
import { useForm } from 'react-hook-form';

const Login = () => {
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
    <div onSubmit={handleSubmit((values) => logIn(values))} className={"w-full h-screen bg-[var(--color-sec)] relative"}>
      <form
        className={"w-[350px] max-esml:w-[95%] flex flex-col window-center gap-[15px] relative bg-[var(--color-main)] rounded-[15px] p-[20px_20px_35px_20px]"}
      >
        <div className={"flex items-center justify-between"}>
          <IconButton size={"xl"} title={"Sign up"} iconClassName={"text-[var(--color-sec)]"}
                      onClick={() => navigate("/signup")}
                      icon={faCircleUser}/>
          <span className={"inline-block text-[var(--color-text)] uppercase font-bold"}>
            Sign in
          </span>
          <IconButton type={"submit"} size={"xl"} title={"Sign in"} iconClassName={"text-[var(--color-sec)]"}
                      icon={faRightToBracket}
          />
        </div>
        <div className={"flex flex-col gap-[10px]"}>
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

export default Login;