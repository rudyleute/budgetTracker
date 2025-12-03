import { useEffect, useState, createContext, useContext } from "react";
import { auth, provider } from "../services/firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  deleteUser
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { processErrors } from '../helpers/firebaseErrors.js';
import { toast } from 'react-toastify';
import { formToast } from '../helpers/toast.jsx';
import { debounce } from 'lodash';
import { useLoader } from './LoaderProvider.jsx';
import api from '../services/axios.js';

const AccountContext = createContext({});
const useAccount = () => useContext(AccountContext);

const AccountProvider = ({ children }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const debouncedAuthHandler = debounce(async (user) => {
      if (user) {
        if (user.emailVerified) setAuthenticated(true);
        else setAuthenticated(false);
      } else setAuthenticated(false);
      setLoading(false);
    }, 600);

    const unsubscribe = onAuthStateChanged(auth, debouncedAuthHandler);
    return () => {
      debouncedAuthHandler.cancel();
      unsubscribe();
    };
  }, []);

  const signUp = async (data) => {
    showLoader();
    try {
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password);

      const userRes = await api.post("/users");

      if (!userRes.data) {
        toast.error(formToast(userRes.message));
        await deleteUser(result.user);
        return;
      }
      const user = result.user;

      await sendEmailVerification(user);
      await signOut(auth)

      navigate("/login")
      toast.success(formToast("Account created! Please check your email to verify your account"))
    } catch (e) {
      toast.error(formToast(processErrors(e.code)));
    } finally {
      hideLoader();
    }
  }

  const logIn = async (data) => {
    showLoader();
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
      hideLoader();
    }
  }

  const logOut = async () => {
    showLoader();

    try {
      await signOut(auth);
    } catch (e) {
      toast.error(formToast(processErrors(e.code)));
    } finally {
      hideLoader();
    }
  }

  return (
    <AccountContext.Provider value={{ isAuthenticated, signUp, logIn, logOut, loading }}>
      {children}
    </AccountContext.Provider>
  )
}

export { useAccount, AccountProvider };