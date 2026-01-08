'use client';
import { useState } from 'react';
import { addStudent } from '@/lib/data';

export default function StudentForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        id: '',
        career: '',
        antecedents: '',
        destination: 'CADE',
        destinationDetail: '',
        priority: 'LOW' // Default green
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name && formData.id && formData.career && formData.antecedents) {
            addStudent(formData);
            setFormData({
                name: '',
                id: '',
                career: '',
                antecedents: '',
                destination: 'CADE',
                destinationDetail: '',
                priority: 'LOW'
            });
            if (onSuccess) onSuccess();
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
                        name="id"
                        placeholder="Matrícula"
                        value={formData.id}
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

                <button type="submit" className="bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 mt-2">
                    Guardar Ficha
                </button>
            </form>
        </div>
    );
}
