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
    if (typeof window !== 'undefined') {
        // CLIENTE (Navegador): Forzar Long Polling para saltar bloqueos (Eduroam/Entel)
        db = initializeFirestore(app, { experimentalForceLongPolling: true });
    } else {
        // SERVIDOR (Node/Vercel): Usar conexión estándar (rápida, evita Timeout 504)
        db = getFirestore(app);
    }
} catch (e) {
    // Si ya existe instancia, usarla
    db = getFirestore(app);
}

export { db };
export const auth = getAuth(app);
