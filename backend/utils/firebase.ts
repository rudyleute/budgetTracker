import admin from 'firebase-admin';
import {checkRequired} from "./general";

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: checkRequired('FIREBASE_PROJECT_ID'),
        clientEmail: checkRequired('FIREBASE_CLIENT_EMAIL'),
        privateKey: checkRequired('FIREBASE_PRIVATE_KEY')
    })
});

export default admin;