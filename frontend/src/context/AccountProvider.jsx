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
import useLoader from '../hooks/useLoader.jsx';
import api from '../services/axios.js';
import { CategoriesProvider } from './CategoriesProvider.jsx';
import { ConfirmationProvider } from './ConfirmationProvider.jsx';
import { ModalProvider } from './ModalProvider.jsx';
import { TransactionsProvider } from './TransactionsProvider.jsx';

const AccountContext = createContext({});
const useAccount = () => useContext(AccountContext);

const AccountProvider = ({ children }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const {
    hideLoader: hideAuthLoader,
    LoaderElement: AuthLoader
  } = useLoader({ isLoading: true, overlayColor: "bg-[var(--color-main)]" });
  const {
    showLoader: showActionLoader,
    hideLoader: hideActionLoader,
    LoaderElement: Loader
  } = useLoader();
  const navigate = useNavigate();

  useEffect(() => {
    //Debouncer is needed for enforcing email verification - the user is logged out immediately after signing up successfully
    const debouncedAuthHandler = debounce(async (user) => {
      if (user && user.emailVerified) setAuthenticated(true);
      else setAuthenticated(false);

      hideAuthLoader();
    }, 600);

    const unsubscribe = onAuthStateChanged(auth, debouncedAuthHandler);
    return () => {
      debouncedAuthHandler.cancel();
      unsubscribe();
    };
  }, []);

  const signUp = async (data) => {
    showActionLoader();
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
      hideActionLoader();
    }
  }

  const logIn = async (data) => {
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
  }

  const logOut = async () => {
    showActionLoader();

    try {
      await signOut(auth);
    } catch (e) {
      toast.error(formToast(processErrors(e.code)));
    } finally {
      hideActionLoader();
    }
  }

  //AuthLoader and Loader render children only when loading is not happening
  return (
    <AccountContext.Provider value={{ isAuthenticated, signUp, logIn, logOut }}>
      <AuthLoader>
        {
          isAuthenticated ?
            <TransactionsProvider>
              <CategoriesProvider>
                <ConfirmationProvider>
                  <ModalProvider>
                    {children}
                  </ModalProvider>
                </ConfirmationProvider>
              </CategoriesProvider>
            </TransactionsProvider> :
            children
        }
        <Loader/>
      </AuthLoader>
    </AccountContext.Provider>
  )
}

export { useAccount, AccountProvider };