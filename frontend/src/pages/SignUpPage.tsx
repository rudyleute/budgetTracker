import { useNavigate } from 'react-router-dom';
import Input from '../components/simple/Input';
import IconButton from '../components/simple/IconButton';
import { faRightToBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAccount } from '../context/AccountProvider';
import { signUpFormUtils } from '../resolvers/signUpResolver';
import { useForm } from 'react-hook-form';
import { useMemo } from 'react';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import LinkIcon from '../components/simple/LinkIcon';
import {SignUpArg} from "../types/accountProvider";

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
        } satisfies Record<keyof SignUpArg, unknown>,
        mode: "onSubmit",
        reValidateMode: "onSubmit"
    })

    const navigate = useNavigate();
    const { signUp, signInWithGoogle, CODES } = useAccount();

    return (
        <div onSubmit={handleSubmit(async (values) => {
            const res = await signUp(values as SignUpArg);
            if (res === CODES.SUCCESS) navigate('/login');
        })}
             className={"w-full h-screen bg-(--color-sec) relative"}>
            <form
                className={"w-[350px] max-esml:w-[95%] flex flex-col window-center gap-[15px] relative bg-(--color-main) rounded-[15px] p-[20px_20px_35px_20px]"}
            >
                <div className={"grid grid-cols-[2fr_4fr_2fr] gap-[5px] items-center"}>
                    <div className={"w-fit"}>
                        <LinkIcon to={"/login"} className={"mr-1"} title={"Sign in"} iClassName={"text-(--color-third)"} icon={faUser} />
                        <IconButton title={"Sign in with google"} iconClassName={"text-(--color-third)"}
                                    onClick={signInWithGoogle}
                                    icon={faGoogle}/>
                    </div>
                    <span className={"justify-self-center text-(--color-text) uppercase font-bold"}>
            Sign up
          </span>
                    <IconButton className={"justify-self-end"} type={"submit"} title={"Sign in"}
                                iconClassName={"text-(--color-third)"}
                                icon={faRightToBracket}
                    />
                </div>
                <div className={"flex flex-col gap-2.5"}>
                    <Input autoComplete={"email"} required={fieldsMeta.email.required}
                           error={errors.email} {...register("email", {
                        onChange: () => clearErrors("email")
                    })} lClassName={"!text-[1.2rem]"} wClassName={"!text-[1.1rem]"} type={"text"}
                           label={"Email"} id={"email"} name={"email"}
                    />
                    <Input autoComplete={"new-password"} required={fieldsMeta.password.required} error={errors.password}
                           lClassName={"!text-[1.1rem]"}
                           wClassName={"!text-[1.1rem]"}  {...register("password", {
                        onChange: () => clearErrors("password")
                    })} type={"password"} label={"Password"} id={"password"} name={"password"}
                    />

                    <Input autoComplete={"new-password"} required={fieldsMeta.confirmPassword.required}
                           error={errors.confirmPassword} lClassName={"!text-[1.1rem]"}
                           wClassName={"!text-[1.1rem]"}  {...register("confirmPassword", {
                        onChange: () => clearErrors("confirmPassword")
                    })} type={"password"} label={"Confirm password"} id={"confirmPassword"} name={"confirmPassword"}
                    />
                </div>
            </form>
        </div>
    )
}


export default SignUpPage;