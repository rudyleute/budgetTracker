import {auth} from "../services/firebase.js";
import PillButtons from '../components/simple/PillButtons.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelopeCircleCheck,
  faEnvelopesBulk,
  faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useAccount } from '../context/AccountProvider.jsx';
import { formToast } from '../helpers/toast.jsx';
import { toast } from 'react-toastify';

const VerifyPage = () => {
  const { logOut, requestVerificationEmail, checkEmailVerification, CODES } = useAccount();
  return (
    <div className={"w-full h-screen bg-(--color-sec) relative"}>
      <div className={"text-(--color-text) text-xl min-w-[350px] max-w-[400px] h-fit min-h-fit max-esml:w-[95%] flex flex-col window-center gap-[25px] relative bg-(--color-main) rounded-[15px] p-[30px_20px]"}>
        <span>
          Please, check your inbox (and its spam folder) and verify your email in order to continue.
          The verification email has been sent to
          <span className={"font-bold text-(--color-third)"}> {auth.currentUser?.email} </span>
          after the registration.
        </span>
        <PillButtons color={"(--color-third)"} bClassName={"w-[33%]!"} className={"w-full! h-10 justify-center"} buttons={[
          { content: <FontAwesomeIcon icon={faEnvelopesBulk}/>, title: "Resend a verification email", onClick: requestVerificationEmail },
          { content: <FontAwesomeIcon icon={faEnvelopeCircleCheck}/>, title: "Confirm successful verification",
            onClick: async () => {
              if (await checkEmailVerification() === CODES.ERROR) toast.error(formToast("The email has not yet been verified"));
          }},
          { content: <FontAwesomeIcon icon={faRightFromBracket}/>, title: "Log out", onClick: logOut },
        ]}/>
      </div>
    </div>
  )
}

export default VerifyPage;