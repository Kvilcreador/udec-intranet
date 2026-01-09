'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function LoginScreen() {
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            // Login with the email from Google
            login(result.user);
        } catch (error) {
            console.error(error);
            setError('Error de autenticación con Google: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 p-6 text-center">
                    <h1 className="text-white text-2xl font-bold mb-1">UDEC Gestión</h1>
                    <p className="text-blue-100 text-sm">Autenticación Real (Google)</p>
                </div>

                <div className="p-8">
                    <p className="text-gray-600 mb-6 text-sm text-center">
                        Inicie sesión con su cuenta Institucional o Google Personal.
                    </p>

                    {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded border border-red-100 mb-4">{error}</p>}

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full bg-white text-gray-700 font-bold py-3 rounded-md border border-gray-300 hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Conectando...' : (
                            <>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
                                <span>Iniciar con Google</span>
                            </>
                        )}
                    </button>

                    <div className="mt-6 text-xs text-center text-gray-400">
                        <p>Asegúrese de que el dominio <strong>udec-intranet.firebaseapp.com</strong> esté permitido en su navegador.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
