'use client';
import { useState } from 'react';
import { analyzeText } from '@/lib/data';

export default function NLPInput() {
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);

    const handleAnalyze = () => {
        const analysis = analyzeText(text);
        setResult(analysis);
    };

    return (
        <div className="bg-card p-6 rounded-lg shadow-sm border border-blue-100">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-900">
                <span>⚡</span> Extracción Inteligente
            </h3>
            <p className="text-xs text-muted mb-4">Pegue aquí el relato de entrevista o correo para análisis automático.</p>

            <textarea
                className="w-full p-3 text-sm border rounded-md mb-4 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                rows={4}
                placeholder="Ej: Refiere problemas de insomnio por ansiedad académica..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <button
                onClick={handleAnalyze}
                disabled={!text}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
                Analizar Texto
            </button>

            {result && (
                <div className="mt-4 p-4 bg-white rounded-md border border-gray-200 shadow-inner">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Resultados del Motor:</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {result.alerts.length > 0 ? result.alerts.map((a, i) => (
                            <span key={i} className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-md border border-red-100 flex items-center gap-1">
                                ⚠️ {a}
                            </span>
                        )) : <span className="text-xs text-green-600 font-medium">✓ No se encontraron alertas de riesgo.</span>}
                    </div>
                    {result.alerts.length > 0 && (
                        <p className="text-xs text-red-500 mt-2">
                            * El nivel de riesgo sugerido se ha actualizado.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
