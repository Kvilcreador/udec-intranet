'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (email.trim() === 'jourzua@udec.cl' || email.trim() === 'etorres2016@udec.cl') {
            login(email.trim());
        } else {
            setError('Usuario no autorizado para esta prueba. Intente con jourzua@udec.cl o etorres2016@udec.cl');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 p-6 text-center">
                    <h1 className="text-white text-2xl font-bold mb-1">UDEC Gestión</h1>
                    <p className="text-blue-100 text-sm">Entorno de Pruebas (Beta)</p>
                </div>

                <div className="p-8">
                    <p className="text-gray-600 mb-6 text-sm text-center">
                        Ingrese su correo institucional para acceder al perfil correspondiente.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">CORREO ELECTRÓNICO</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nombre@udec.cl"
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                autoFocus
                            />
                        </div>

                        {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-2 rounded border border-red-100">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-gray-900 text-white font-bold py-3 rounded-md hover:bg-black transition-all shadow-md"
                        >
                            Acceder al Sistema
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-center text-gray-400">
                        <p className="font-bold mb-2">Credenciales de Acceso:</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setEmail('jourzua@udec.cl')} className="hover:text-blue-600 hover:underline">jourzua@udec.cl (Admin)</button>
                            <span>|</span>
                            <button onClick={() => setEmail('etorres2016@udec.cl')} className="hover:text-blue-600 hover:underline">etorres2016@udec.cl (Pro)</button>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-400 max-w-sm text-center">
                Nota: Esta versión de prueba utiliza almacenamiento local. Los datos ingresados son visibles para todos los usuarios por defecto (Pre-sembrados), pero los nuevos cambios solo se guardarán en este dispositivo.
            </p>
        </div>
    );
}
