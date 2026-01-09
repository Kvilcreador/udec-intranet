import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAI24tsdx-NAyxfn2_NzyjFnqTxh_uoVgw",
    authDomain: "udec-intranet.firebaseapp.com",
    projectId: "udec-intranet",
    storageBucket: "udec-intranet.firebasestorage.app",
    messagingSenderId: "261991266246",
    appId: "1:261991266246:web:b0d5a3ef55e003e8a124c7",
    measurementId: "G-DRFP2JC516"
};

// Revertir a configuración automática (WebSockets) mejor para redes móviles 4G
import { getAuth } from "firebase/auth";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
