'use client';
import { useState } from 'react';
import { addStudent } from '@/lib/data';

const CONSULTATION_REASONS = [
    "MC 1: Problemas de organización y planificación",
    "MC 2: Regulación emocional",
    "MC 3: Síntomas depresivos",
    "MC 4: Síntomas de ansiedad",
    "MC 5: Baja autoestima o inseguridad",
    "MC 6: Desmotivación académica o personal",
    "MC 7: Dificultades de adaptación",
    "MC 8: Eventos estresantes recientes",
    "MC 9: Dificultades interpersonales",
    "MC 10: Malestar inespecífico",
    "MC 11: Crisis vocacional o motivacional",
    "MC 12: Trámites y certificaciones"
];

export default function StudentForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        matricula: '',
        career: '',
        antecedents: '',
        source: 'DISE', // Default source
        consultationReason: '',
        destination: 'CADE',
        destinationDetail: '',
        priority: 'LOW' // Default green
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.name && formData.matricula && formData.career && formData.antecedents) {
            setIsSubmitting(true);
            try {
                await addStudent(formData);
                setFormData({
                    name: '',
                    matricula: '',
                    career: '',
                    antecedents: '',
                    source: 'DISE',
                    consultationReason: '',
                    destination: 'CADE',
                    destinationDetail: '',
                    priority: 'LOW'
                });
                if (onSuccess) onSuccess();
            } catch (error) {
                alert('Error al guardar: ' + error.message);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            alert('Complete los campos obligatorios');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-card p-6 rounded-lg shadow-sm border mb-8">
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>📝</span> Nuevo Ingreso
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        name="name"
                        placeholder="Nombre Completo"
                        value={formData.name}
                        onChange={handleChange}
                        className="p-2 border rounded bg-gray-50 text-sm"
                    />
                    <input
                        name="matricula"
                        placeholder="Matrícula"
                        value={formData.matricula}
                        onChange={handleChange}
                        className="p-2 border rounded bg-gray-50 text-sm"
                    />
                    <input
                        name="career"
                        placeholder="Carrera"
                        value={formData.career}
                        onChange={handleChange}
                        className="p-2 border rounded bg-gray-50 text-sm"
                    />
                </div>

                <textarea
                    name="antecedents"
                    rows={4}
                    placeholder="Antecedentes y apreciaciones del evaluador..."
                    value={formData.antecedents}
                    onChange={handleChange}
                    className="p-3 border rounded bg-gray-50 text-sm w-full"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500">Entidad Derivadora (Origen)</label>
                        <select
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            className="p-2 border rounded bg-gray-50 text-sm w-full"
                        >
                            <option value="DISE">DISE</option>
                            <option value="CADE">CADE</option>
                            <option value="OTROS">OTROS</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500">Motivo de Consulta (Tipificación)</label>
                        <select
                            name="consultationReason"
                            value={formData.consultationReason}
                            onChange={handleChange}
                            className="p-2 border rounded bg-gray-50 text-sm w-full"
                        >
                            <option value="">-- Seleccionar Motivo --</option>
                            {CONSULTATION_REASONS.map(reason => (
                                <option key={reason} value={reason}>{reason}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500">Destino Derivación</label>
                        <div className="flex gap-2">
                            <select
                                name="destination"
                                value={formData.destination}
                                onChange={handleChange}
                                className="p-2 border rounded bg-gray-50 text-sm flex-1"
                            >
                                <option value="CADE">CADE</option>
                                <option value="DISE">DISE</option>
                                <option value="OTROS">OTROS</option>
                            </select>
                            {formData.destination === 'OTROS' && (
                                <input
                                    name="destinationDetail"
                                    placeholder="Especifique..."
                                    value={formData.destinationDetail}
                                    onChange={handleChange}
                                    className="p-2 border rounded bg-gray-50 text-sm flex-1"
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500">Nivel de Prioridad</label>
                        <div className="flex gap-2">
                            {['LOW', 'MEDIUM', 'HIGH'].map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, priority: level }))}
                                    className={`flex-1 py-2 text-xs font-bold rounded border transition-all ${formData.priority === level
                                        ? level === 'HIGH' ? 'bg-red-500 text-white border-red-600'
                                            : level === 'MEDIUM' ? 'bg-yellow-400 text-black border-yellow-500'
                                                : 'bg-green-500 text-white border-green-600'
                                        : 'bg-white text-gray-400 border-gray-200'
                                        }`}
                                >
                                    {level === 'HIGH' ? '🔴 CRÍTICO' : level === 'MEDIUM' ? '🟡 ALERTA' : '🟢 NORMAL'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Guardando...' : 'Guardar Ficha'}
                </button>
            </form>
        </div>
    );
}
