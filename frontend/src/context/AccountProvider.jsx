import { useEffect, useState, createContext, useContext, useMemo, useCallback } from "react";
import { auth, provider } from "../services/firebase.js";
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
  reauthenticateWithPopup,
  GoogleAuthProvider,
  unlink
} from "firebase/auth";
import { processErrors } from '../helpers/firebaseErrors.js';
import { toast } from 'react-toastify';
import { formToast } from '../helpers/toast.jsx';
import { debounce } from 'lodash';
import useLoader from '../hooks/useLoader.jsx';
import api from '../services/axios.js';
import { authStatuses } from '../helpers/variables.js';

const CODES = { "SUCCESS": 0, "ERROR": -1, "WRONG_PWD": -2 };
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
          return CODES.ERROR;
        }
      }

      return CODES.SUCCESS;
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') toast.error(formToast(processErrors(e.code)));

      return CODES.ERROR;
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
        return CODES.ERROR;
      }
      const user = result.user;

      await sendEmailVerification(user);
      await signOut(auth)

      toast.success(formToast("Account created! Please check your email to verify your account"))
      return CODES.SUCCESS;
    } catch (e) {
      toast.error(formToast(processErrors(e.code)));
      return CODES.ERROR;
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
      return CODES.SUCCESS;
    } catch (e) {
      toast.error(formToast(processErrors(e.code)));
      return CODES.ERROR;
    } finally {
      hideActionLoader();
    }
  }, [hideActionLoader, showActionLoader])

  const checkEmailVerification = useCallback(async () => {
    showActionLoader();
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) setAuthStatus(authStatuses.loggedVerified);
      return auth.currentUser.emailVerified ? CODES.SUCCESS : CODES.ERROR;
    } catch (e) {
      toast.error(formToast(processErrors(e.code)));
      return CODES.ERROR;
    } finally {
      hideActionLoader();
    }
  }, [hideActionLoader, showActionLoader])

  const reauthenticate = useCallback(async (password = null) => {
    try {
      const user = auth.currentUser;

      const hasPassword = user.providerData.some(p => p.providerId === 'password');
      const hasGoogle = user.providerData.some(p => p.providerId === 'google.com');

      if (hasPassword && password) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
        await reauthenticateWithCredential(auth.currentUser, credential);
      } else if (hasGoogle && !password) {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else {
        toast.error(formToast("Invalid provider"));
        return CODES.ERROR;
      }

      return CODES.SUCCESS;
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') toast.error(formToast(processErrors(e.code)));
      if (e.code === "auth/wrong-password") return CODES.WRONG_PWD;
      return CODES.ERROR;
    }
  }, [])

  const requestEmailChange = useCallback(async (newEmail, password) => {
    showActionLoader();
    try {
      const reauthCode = await reauthenticate(password);
      if (reauthCode === CODES.SUCCESS) {
        //In order to enable changing the email, the google account must be unlinked as it is not possible to have providers with different emails attached to the same account
        if (auth.currentUser.providerData.some(p => p.providerId === 'google.com')) await unlink(auth.currentUser, "google.com");
        await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
        toast.success(formToast("A verification link has been sent to the new email!"));
      } else return reauthCode;

      return CODES.SUCCESS;
    } catch (e) {
      toast.error(formToast(processErrors(e.code)));
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