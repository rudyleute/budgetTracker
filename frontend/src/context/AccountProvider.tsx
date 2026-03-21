import { useEffect, useState, createContext, useContext, useMemo, useCallback } from "react";
import { auth, provider } from "../services/firebase";
import { getAdditionalUserInfo } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendEmailVerification,
    onAuthStateChanged,
    deleteUser,
    verifyBeforeUpdateEmail,
    reauthenticateWithCredential,
    EmailAuthProvider,
    unlink
} from "firebase/auth";
import { processErrors } from '../helpers/firebaseErrors';
import { toast } from 'react-toastify';
import { formToast } from '../helpers/toast';
import { debounce } from 'lodash';
import useLoader from '../hooks/useLoader';
import api from '../services/axios';
import {AuthStatus, authStatuses} from '../helpers/variables';
import {AccountProviderProps, Login, ReAuth, ReqEmailChange, SignUp} from "../types/accountProvider";
import React from 'react';

const CODES = { "SUCCESS": 0, "ERROR": -1, "WRONG_PWD": -2 } as const;
export type Codes = typeof CODES[keyof typeof CODES];

type BasicFunc<E = Codes | void> = () => Promise<E>;
interface AccountContextType {
    authStatus: AuthStatus
    signUp: SignUp
    logIn: Login
    logOut: BasicFunc<void>
    signInWithGoogle: BasicFunc<Codes>
    requestVerificationEmail: BasicFunc<Codes>
    checkEmailVerification: BasicFunc<Codes>
    requestEmailChange: ReqEmailChange
    CODES: typeof CODES
}

const AccountContext = createContext<AccountContextType>({} as AccountContextType);
const useAccount = () => useContext(AccountContext);

const errorHandler = (e: unknown): void => {
    if (e instanceof FirebaseError) {
        if (e.code !== 'auth/popup-closed-by-user') toast.error(formToast(processErrors(e.code)));
    } else if (e instanceof Error) toast.error(formToast(e.message));
    else toast.error(formToast("Unknown error occurred"))
}

const AccountProvider = ({ children, onAuthReady }: AccountProviderProps) => {
    const [authStatus, setAuthStatus] = useState<AuthStatus>(authStatuses.anon);

    const {
        showLoader: showActionLoader,
        hideLoader: hideActionLoader,
        LoaderElem: Loader
    } = useLoader();

    useEffect(() => {
        //Debouncer is needed for enforcing email verification - the user is logged out immediately after signing up successfully
        const debouncedAuthHandler = debounce(async (user) => {
            if (user) {
                if (user.emailVerified) setAuthStatus(authStatuses.loggedVerified)
                else setAuthStatus(authStatuses.loggedUnverified)
            } else setAuthStatus(authStatuses.anon);

            onAuthReady();
        }, 600);

        const unsubscribe = onAuthStateChanged(auth, debouncedAuthHandler);
        return () => {
            debouncedAuthHandler.cancel();
            unsubscribe();
        };
    }, [onAuthReady]);

    const signInWithGoogle: BasicFunc<Codes> = useCallback(async () => {
        showActionLoader();
        try {
            const res = await signInWithPopup(auth, provider);
            const isNewUser: boolean = getAdditionalUserInfo(res)?.isNewUser || false;

            //if there are several providers associated with the account, or if it is a sign in, the data has already been saved on the backend
            if (isNewUser) {
                const userRes = await api.post("/users");

                if (!userRes.data) {
                    toast.error(formToast(userRes.message));
                    await signOut(auth);
                    return CODES.ERROR;
                }
            }

            return CODES.SUCCESS;
        } catch (e: unknown) {
            errorHandler(e);

            return CODES.ERROR;
        } finally {
            hideActionLoader();
        }
    }, [hideActionLoader, showActionLoader]);

    const signUp: SignUp = useCallback(async (data) => {
        showActionLoader();
        try {
            const result = await createUserWithEmailAndPassword(auth, data.email, data.password);

            //No need to check whether the user is new here as the function above will throw an error in this case
            const userRes = await api.post("/users");

            if (!userRes.data) {
                toast.error(formToast(userRes.message));
                await deleteUser(result.user);
                return CODES.ERROR;
            }
            const user = result.user;

            await sendEmailVerification(user);
            await signOut(auth)

            toast.success(formToast("Account created! Please check your email to verify your account"))
            return CODES.SUCCESS;
        } catch (e) {
            errorHandler(e);
            return CODES.ERROR;
        } finally {
            hideActionLoader();
        }
    }, [hideActionLoader, showActionLoader])

    const logIn: Login = useCallback(async (data) => {
        showActionLoader();
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
        } catch (e) {
            errorHandler(e);
        } finally {
            hideActionLoader();
        }
    }, [hideActionLoader, showActionLoader]);

    const logOut: BasicFunc<void> = useCallback(async () => {
        showActionLoader();
        try {
            await signOut(auth);
        } catch (e) {
            errorHandler(e);
        } finally {
            hideActionLoader();
        }
    }, [hideActionLoader, showActionLoader]);

    const requestVerificationEmail: BasicFunc<Codes> = useCallback(async () => {
        showActionLoader();

        if (!auth.currentUser) {
            toast.error(formToast("Unauthenticated user"));
            return CODES.ERROR;
        }

        try {
            await sendEmailVerification(auth.currentUser);

            toast.success(formToast("The verification link has been sent to your email!"))
            return CODES.SUCCESS;
        } catch (e) {
            errorHandler(e);
            return CODES.ERROR;
        } finally {
            hideActionLoader();
        }
    }, [hideActionLoader, showActionLoader])

    const checkEmailVerification: BasicFunc<Codes> = useCallback(async () => {
        showActionLoader();
        if (!auth.currentUser) {
            toast.error(formToast("Unauthenticated user"));
            return CODES.ERROR;
        }

        try {
            await auth.currentUser.reload();
            if (auth.currentUser.emailVerified) setAuthStatus(authStatuses.loggedVerified);
            return auth.currentUser.emailVerified ? CODES.SUCCESS : CODES.ERROR;
        } catch (e) {
            errorHandler(e);
            return CODES.ERROR;
        } finally {
            hideActionLoader();
        }
    }, [hideActionLoader, showActionLoader])

    const reauthenticate: ReAuth = useCallback(async (password) => {
        if (!auth.currentUser) {
            toast.error(formToast("Unauthenticated user"));
            return CODES.ERROR;
        }

        try {
            const user = auth.currentUser;
            const hasPassword = user.providerData.some(p => p.providerId === 'password');

            if (hasPassword && password) {
                const credential = EmailAuthProvider.credential(auth.currentUser.email!, password);
                await reauthenticateWithCredential(auth.currentUser, credential);
            } else {
                toast.error(formToast("Invalid provider"));
                return CODES.ERROR;
            }

            return CODES.SUCCESS;
        } catch (e) {
            errorHandler(e);
            if (e instanceof FirebaseError) {
                if (e.code === "auth/wrong-password") return CODES.WRONG_PWD;
            }
            return CODES.ERROR;
        }
    }, [])

    const requestEmailChange: ReqEmailChange = useCallback(async (newEmail, password) => {
        showActionLoader();
        if (!auth.currentUser) {
            toast.error(formToast("Unauthenticated user"));
            return CODES.ERROR;
        }

        try {
            const reAuthCode = await reauthenticate(password);
            if (reAuthCode === CODES.SUCCESS) {
                //In order to enable changing the email, the google account must be unlinked as it is not possible to have providers with different emails attached to the same account
                if (auth.currentUser.providerData.some(p => p.providerId === 'google.com')) await unlink(auth.currentUser, "google.com");
                await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
                toast.success(formToast("A verification link has been sent to the new email!"));
            } else return reAuthCode;

            return CODES.SUCCESS;
        } catch (e) {
            errorHandler(e);
            return CODES.ERROR;
        } finally {
            hideActionLoader();
        }
    }, [hideActionLoader, reauthenticate, showActionLoader])

    const value = useMemo(() => ({
        authStatus,
        signUp,
        logIn,
        logOut,
        signInWithGoogle,
        requestVerificationEmail,
        checkEmailVerification,
        requestEmailChange,
        CODES
    }), [authStatus, requestEmailChange, logIn, logOut, signUp, signInWithGoogle, requestVerificationEmail, checkEmailVerification])

    return (
        <AccountContext.Provider value={value}>
            {children}
            <Loader/>
        </AccountContext.Provider>
    )
}

export { useAccount, AccountProvider };