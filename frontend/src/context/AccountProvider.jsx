import { useEffect, useState, createContext, useContext, useMemo, useCallback } from "react";
import { auth, provider } from "../services/firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  deleteUser
} from "firebase/auth";
import { processErrors } from '../helpers/firebaseErrors.js';
import { toast } from 'react-toastify';
import { formToast } from '../helpers/toast.jsx';
import { debounce } from 'lodash';
import useLoader from '../hooks/useLoader.jsx';
import api from '../services/axios.js';
import { authStatuses } from '../helpers/variables.js';

const AccountContext = createContext({});
const useAccount = () => useContext(AccountContext);

const AccountProvider = ({ children, onAuthReady }) => {
  const [authStatus, setAuthStatus] = useState(authStatuses.anon);

  const {
    showLoader: showActionLoader,
    hideLoader: hideActionLoader,
    LoaderElement: Loader
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

  const signInWithGoogle = useCallback(async () => {
    showActionLoader();
    try {
      const res = await signInWithPopup(auth, provider);

      //if there are several providers associated with the account, or if it is a sign in, the date has already been saved on the backend
      if (res._tokenResponse?.isNewUser) {
        const userRes = await api.post("/users");

        if (!userRes.data) {
          toast.error(formToast(userRes.message));
          await signOut(auth);
          return false;
        }
      }

      return true;
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user') return false;
      else toast.error(formToast(processErrors(e.code)));

      return false;
    } finally {
      hideActionLoader();
    }
  }, [hideActionLoader, showActionLoader]);

  const signUp = useCallback(async (data) => {
    showActionLoader();
    try {
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password);

      //No need to check whether the user is new here as the function above will throw an error in this case
      const userRes = await api.post("/users");

      if (!userRes.data) {
        toast.error(formToast(userRes.message));
        await deleteUser(result.user);
        return false;
      }
      const user = result.user;

      await sendEmailVerification(user);
      await signOut(auth)

      toast.success(formToast("Account created! Please check your email to verify your account"))
      return true;
    } catch (e) {
      toast.error(formToast(processErrors(e.code)));
      return false;
    } finally {
      hideActionLoader();
    }
  }, [hideActionLoader, showActionLoader])

  const logIn = useCallback(async (data) => {
    showActionLoader();
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (e) {
      toast.error(formToast(processErrors(e.code)));
    } finally {
      hideActionLoader();
    }
  }, [hideActionLoader, showActionLoader]);

  const logOut = useCallback(async () => {
    showActionLoader();
    try {
      await signOut(auth);
    } catch (e) {
      toast.error(formToast(processErrors(e.code)));
    } finally {
      hideActionLoader();
    }
  }, [hideActionLoader, showActionLoader]);

  const requestVerificationEmail = useCallback(async () => {
    showActionLoader();
    try {
      await sendEmailVerification(auth.currentUser);

      toast.success(formToast("The verification link has been sent to your email!"))
      return true;
    } catch (e) {
      toast.error(formToast(processErrors(e.code)));
      return false;
    } finally {
      hideActionLoader();
    }
  }, [hideActionLoader, showActionLoader])

  const checkEmailVerification = useCallback(async () => {
    showActionLoader();
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) setAuthStatus(authStatuses.loggedVerified);
      return auth.currentUser.emailVerified;
    } catch (e) {
      toast.error(formToast(processErrors(e.code)));
      return auth.currentUser.emailVerified;
    } finally {
      hideActionLoader();
    }
  }, [hideActionLoader, showActionLoader])

  const value = useMemo(() => ({
    authStatus,
    signUp,
    logIn,
    logOut,
    signInWithGoogle,
    requestVerificationEmail,
    checkEmailVerification
  }), [authStatus, logIn, logOut, signUp, signInWithGoogle, requestVerificationEmail, checkEmailVerification])
  return (
    <AccountContext.Provider value={value}>
      {children}
      <Loader/>
    </AccountContext.Provider>
  )
}

export { useAccount, AccountProvider };