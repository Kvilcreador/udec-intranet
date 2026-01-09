'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            login(result.user);
        } catch (error) {
            console.error(error);
            setError('Error Google: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            login(result.user);
        } catch (error) {
            console.error(error);
            setError('Error Acceso: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 p-6 text-center">
                    <h1 className="text-white text-2xl font-bold mb-1">UDEC Gestión</h1>
                    <p className="text-blue-100 text-sm">Autenticación Segura</p>
                </div>

                <div className="p-8 space-y-6">
                    {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded border border-red-100">{error}</p>}

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">CORREO</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nombre@udec.cl"
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">CONTRASEÑA</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gray-900 text-white font-bold py-3 rounded-md hover:bg-black transition-all shadow-md"
                        >
                            {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">O continuar con</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full bg-white text-gray-700 font-bold py-3 rounded-md border border-gray-300 hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
                        <span>Google Institucional</span>
                    </button>

                    <div className="text-xs text-center text-gray-400">
                        <p>Para usar <strong>Microsoft</strong>, el administrador debe habilitarlo en Firebase Console.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
