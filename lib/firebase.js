import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAI24tsdx-NAyxfn2_NzyjFnqTxh_uoVgw",
    authDomain: "udec-intranet.firebaseapp.com",
    projectId: "udec-intranet",
    storageBucket: "udec-intranet.firebasestorage.app",
    messagingSenderId: "261991266246",
    appId: "1:261991266246:web:b0d5a3ef55e003e8a124c7",
    measurementId: "G-DRFP2JC516"
};

// Singleton para evitar re-inicialización
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let db;

// Configuración Condicional:
try {
    // MODO ESCUDO TOTAL: Forzar Long Polling en Cliente Y Servidor
    // Necesario porque 'npm run dev' corre en la misma red bloqueada (Entel/UdeC) que el navegador.
    db = initializeFirestore(app, { experimentalForceLongPolling: true });
} catch (e) {
    // Si ya existe instancia (Hot Reload), usarla
    db = getFirestore(app);
}

export { db };
export const auth = getAuth(app);
