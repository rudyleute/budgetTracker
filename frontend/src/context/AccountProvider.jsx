import { useEffect, useState, createContext, useContext, useMemo, useCallback } from "react";
import { auth } from "../services/firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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

const AccountContext = createContext({});
const useAccount = () => useContext(AccountContext);

const AccountProvider = ({ children, onAuthReady }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  const {
    showLoader: showActionLoader,
    hideLoader: hideActionLoader,
    LoaderElement: Loader
  } = useLoader();

  useEffect(() => {
    //Debouncer is needed for enforcing email verification - the user is logged out immediately after signing up successfully
    const debouncedAuthHandler = debounce(async (user) => {
      if (user && user.emailVerified) setAuthenticated(true);
      else setAuthenticated(false);

      onAuthReady();
    }, 600);

    const unsubscribe = onAuthStateChanged(auth, debouncedAuthHandler);
    return () => {
      debouncedAuthHandler.cancel();
      unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (data) => {
    showActionLoader();
    try {
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password);

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
      const result = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = result.user;

      if (!user.emailVerified) {
        await signOut(auth);
        toast.info(formToast("Please, verify your account in order to be able to log in"));
      }
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

  const value = useMemo(() => ({ isAuthenticated, signUp, logIn, logOut }), [isAuthenticated, logIn, logOut, signUp])
  return (
    <AccountContext.Provider value={value}>
      {children}
      <Loader />
    </AccountContext.Provider>
  )
}

export { useAccount, AccountProvider };