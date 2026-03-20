import 'dotenv';
import {initializeApp} from 'firebase/app';
import {getAuth, GoogleAuthProvider} from 'firebase/auth';
import {checkRequiredEnvField} from '@app/shared/src/utils/general'

// @ts-ignore
const firebaseConfig = {
    apiKey: checkRequiredEnvField('VITE_FIREBASE_API_KEY'),
    authDomain: checkRequiredEnvField('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: checkRequiredEnvField('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: checkRequiredEnvField('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: checkRequiredEnvField('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: checkRequiredEnvField('VITE_FIREBASE_APP_ID'),
}

const app = initializeApp(firebaseConfig);
const auth = getAuth();
auth.useDeviceLanguage(); //Use the language of the device
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    'login_hint': 'user@example.com',
    prompt: 'select_account'
})

export {auth, provider, app};