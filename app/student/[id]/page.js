'use client';
import { useAuth } from '@/lib/auth-context';
import { getStudentById } from '@/lib/data';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import RiskBadge from '@/components/ui/RiskBadge';
import CommentLog from '@/components/student/CommentLog';

export default function StudentPage() {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [student, setStudent] = useState(null);

    // Helper to refresh data
    const refreshStudent = async () => {
        if (id) {
            try {
                const s = await getStudentById(id);
                setStudent(s);
            } catch (e) {
                console.error(e);
            }
        }
    };

    useEffect(() => {
        refreshStudent();
    }, [id]);

    if (!student) return <div className="p-8">Cargando ficha...</div>;

    // Security Check
    // Admin has all access.
    // Professional only access if destination matches area.
    const hasAccess = currentUser?.role === 'admin' || (currentUser?.role === 'professional' && student.destination === currentUser?.area);

    if (!hasAccess) {
        return (
            <div className="p-8 mt-8 text-center bg-white rounded-lg border shadow-sm max-w-md mx-auto">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    🔒
                </div>
                <h2 className="font-bold text-lg text-gray-900 mb-2">Acceso Denegado</h2>
                <p className="text-gray-500 mb-6">No tiene permisos para visualizar esta ficha.</p>
                <Link href="/" className="px-4 py-2 bg-gray-900 text-white rounded-md font-bold text-sm">Volver al Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="container max-w-6xl">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 mb-6 inline-block">← Volver al listado</Link>

            {/* Header Identity */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border-l-4 border-blue-600 flex justify-between items-start">
                <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl font-bold text-gray-400 border">
                        {student.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                        <div className="flex flex-col text-sm text-gray-500 mt-1">
                            <span>{student.career}</span>
                            <span>ID: {student.id}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <RiskBadge level={student.priority} />
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">
                        Destino: {student.destination}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Antecedents & Context */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border h-full">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span>📄</span> Antecedentes del Caso
                        </h3>
                        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                            {student.antecedents || "No se han registrado antecedentes."}
                        </div>
                        {currentUser.role === 'admin' && (
                            <p className="text-xs text-gray-400 mt-2 text-right">Editado por evaluador</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Interaction Log */}
                <div>
                    <CommentLog
                        studentId={student.id}
                        comments={student.comments}
                        onUpdate={refreshStudent}
                    />
                </div>
            </div>
        </div>
    );
}
