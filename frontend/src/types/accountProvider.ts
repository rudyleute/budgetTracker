import {ChildrenProp} from "./basic";
import {Codes} from "../context/AccountProvider";

export interface Password {
    password: string;
}

export interface LoginArg extends Password{
    email: string;
}

export interface SignUpArg extends LoginArg {
    confirmPassword: string;
}

export interface ChangeEmailArg extends Password{
    newEmail: string;
}

export type Login = (value: LoginArg) => Promise<void>;
export type SignUp = (value: SignUpArg) => Promise<Codes>;
export type ReqEmailChange = (newEmail: ChangeEmailArg["newEmail"], password: ChangeEmailArg["password"]) => Promise<Codes>;
export type ReAuth = (password: Password["password"]) => Promise<Codes>;

export interface AccountProviderProps extends ChildrenProp {
    onAuthReady: () => void;
}