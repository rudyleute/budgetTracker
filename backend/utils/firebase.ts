import admin from 'firebase-admin';
import {checkRequiredEnvField} from "@app/shared/src/utils/general";

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: checkRequiredEnvField('FIREBASE_PROJECT_ID'),
        clientEmail: checkRequiredEnvField('FIREBASE_CLIENT_EMAIL'),
        privateKey: checkRequiredEnvField('FIREBASE_PRIVATE_KEY')
    })
});

export default admin;