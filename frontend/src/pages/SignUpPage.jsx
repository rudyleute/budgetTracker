import { useNavigate } from 'react-router-dom';
import Input from '../components/simple/Input.jsx';
import IconButton from '../components/simple/IconButton.jsx';
import { faRightToBracket, faIdBadge } from '@fortawesome/free-solid-svg-icons';
import { useAccount } from '../context/AccountProvider.jsx';
import { signUpFormUtils } from '../resolvers/signUpResolver.js';
import { useForm } from 'react-hook-form';
import { useMemo } from 'react';

const SignUpPage = () => {
  const { resolver: signUpResolver, fieldsMeta } = useMemo(() => {
    return signUpFormUtils();
  }, []);
  const {
    register,
    formState: { errors },
    clearErrors,
    handleSubmit
  } = useForm({
    resolver: signUpResolver,
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  })

  const navigate = useNavigate();
  const { signUp } = useAccount();

  return (
    <div onSubmit={handleSubmit(async (values) => {
      const res = await signUp(values);
      if (res) navigate('/login');
    })}
          className={"w-full h-screen bg-(--color-sec) relative"}>
      <form
        className={"w-[350px] max-esml:w-[95%] flex flex-col window-center gap-[15px] relative bg-(--color-main) rounded-[15px] p-[20px_20px_35px_20px]"}
      >
        <div className={"flex items-center justify-between"}>
          <IconButton size={"xl"} title={"Sign in"} iconClassName={"text-[var(--color-sec)]"}
                      onClick={() => navigate("/login")}
                      icon={faIdBadge}/>
          <span className={"inline-block text-(--color-text) uppercase font-bold"}>
            Sign up
          </span>
          <IconButton type={"submit"} size={"xl"} title={"Sign up"} iconClassName={"text-[var(--color-sec)]"}
                      icon={faRightToBracket}
          />
        </div>
        <div className={"flex flex-col gap-2.5"}>
          <Input required={fieldsMeta.email.required} error={errors.email?.message} {...register("email", {
            onChange: () => clearErrors("email")
          })} lClassName={"!text-[1.2rem]"} wClassName={"!text-[1.1rem]"} type={"text"}
                 label={"Email"} id={"email"} autoComplete={"true"}
          />
          <Input required={fieldsMeta.password.required} error={errors.password?.message} lClassName={"!text-[1.1rem]"}
                 wClassName={"!text-[1.1rem]"}  {...register("password", {
            onChange: () => clearErrors("password")
          })} type={"password"} label={"Password"} id={"password"}
          />

          <Input required={fieldsMeta.confirmPassword.required} error={errors.confirmPassword?.message} lClassName={"!text-[1.1rem]"}
                 wClassName={"!text-[1.1rem]"}  {...register("confirmPassword", {
            onChange: () => clearErrors("confirmPassword")
          })} type={"password"} label={"Confirm password"} id={"confirmPassword"}
          />
        </div>
      </form>
    </div>
  )
}


export default SignUpPage;