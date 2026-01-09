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

// Inicialización con Long Polling forzado para evadir bloqueos de red (WebSockets)
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false, // Compatibility mode
});
