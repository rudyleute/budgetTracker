import { auth } from "../../services/firebase.js";
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faCircleUser, faEnvelope, faKey, faLock, faUserXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PillButtons from '../simple/PillButtons.jsx';
import { useModal } from '../../context/ModalProvider.jsx';
import { useCallback, useRef } from 'react';
import ProfileEmailForm from './ProfileEmailForm.jsx';
import { onFormSubmit } from '../../helpers/utils.js';
import { useAccount } from '../../context/AccountProvider.jsx';
import { useConfirmation } from '../../context/ConfirmationProvider.jsx';
import React from "react";

const providerIconMap = {
    "google.com": {
        icon: faGoogle,
        name: "Google"
    },
    "password": {
        icon: faKey,
        name: "password"
    }
}

/*
 @todo the flow should be the following
 1 - if google account is the only provider of the account, email change should be blocked in the first place
 2 - if google account is present in addition to the password, show a confirmation window that will tell the user that after reauthentication the google account will be unlinked and it would be impossible to use it to sign in
 3 - form with the new email
 4 - after successful validation store the email and prompt a password
 5 - after successful submission of the password call the requestEmailChange function - reauthentication will he handle within that function
 */
const Profile = () => {
    const { showModal, hideModal } = useModal();
    const formRef = useRef(null);
    const { requestEmailChange, CODES  } = useAccount();
    const { showConfirmation } = useConfirmation();

    const onRequiredReauthentication = useCallback(async ({email: newEmail, password}) => {
        //only google and password providers are enabled, so if there is a provider in addition to the password...
        if (auth.currentUser.providerData.length === 2) {
            showConfirmation(
                async () => {
                    if (await requestEmailChange(newEmail, password) === CODES.SUCCESS) hideModal();
                },
                "If you continue, you will not be able to use your Google account to log in and access the data"
            )
        } else {
            if (await requestEmailChange(newEmail, password) === CODES.SUCCESS) hideModal();
        }
    }, [CODES.SUCCESS, hideModal, requestEmailChange, showConfirmation])


    const onEmailSubmit = useCallback(
        async () => onFormSubmit(formRef.current.getData, onRequiredReauthentication),
        [onRequiredReauthentication]
    )

    const onChangeEmailRequest = useCallback(() => {
        showModal(
            "Changing email address",
            <ProfileEmailForm ref={formRef} onSubmit={onEmailSubmit} />
        );
    }, [onEmailSubmit, showModal])

    return (
        <div className={"flex flex-col justify-around h-full"}>
            <div className={"flex flex-col items-center gap-2"}>
                <FontAwesomeIcon size={"4x"} icon={faCircleUser}/>
                {auth.currentUser.displayName && <span>{auth.currentUser.displayName}</span>}
                <span>{auth.currentUser.email}</span>
                <div className={"flex gap-1 mt-1"}>{
                    auth.currentUser.providerData.map(({ providerId }) => {
                        const { icon, name } = providerIconMap[providerId];

                        return <span className={"hover:cursor-pointer bg-(--color-third) p-[2px_8px] rounded-[15px]"}
                                     title={`Authentication via ${name} is enabled for this account`} key={providerId}>
                <FontAwesomeIcon size={"sm"} icon={icon}/>
              </span>
                    })
                }</div>
            </div>
            <PillButtons color={"(--color-third)"} bClassName={"w-[33%]!"} className={"w-full! h-10 justify-center"}
                         buttons={[
                             { content: <FontAwesomeIcon icon={faEnvelope}/>, title: "Change email", onClick: auth.currentUser.providerData.some(e => e.providerId === "password") && onChangeEmailRequest },
                             { content: <FontAwesomeIcon icon={faLock}/>, title: "Change password" },
                             { content: <FontAwesomeIcon icon={faUserXmark}/>, title: "Delete account" }
                         ]}
            />
        </div>
    )
}

export default Profile;