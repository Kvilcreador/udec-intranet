'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getStudentsForUser } from '@/lib/data';
import RiskBadge from '@/components/ui/RiskBadge';
import Link from 'next/link';
import StudentForm from '@/components/dashboard/StudentForm';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Requirement 3: Fetch on Load (Cloud First)
  const fetchCloudData = async () => {
    if (!currentUser) return;

    setLoading(true);
    setErrorMsg(''); // Clear previous errors
    try {
      const data = await getStudentsForUser(currentUser.email);
      setStudents(data);
      setIsConnected(true);
    } catch (error) {
      console.error("Cloud Connection Failed:", error);
      setIsConnected(false);
      // Translate common Firebase errors for better UX
      let msg = error.message;
      if (msg.includes("Missing or insufficient permissions")) {
        msg = "Bloqueado por Reglas de Seguridad de Firebase (Permisos insuficientes).";
      } else if (msg.includes("client is offline")) {
        msg = "El dispositivo no tiene internet.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCloudData();
  }, [currentUser]);

  const highRiskCount = students.filter(s => s.priority === 'HIGH').length;

  return (
    <div className="container">
      <header className="flex flex-col mb-8 gap-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              Panel de Gestión v2.0
              {/* Requirement 5: Connection Diagnostic Indicator */}
              <span className={`text-xs font-bold px-2 py-1 rounded border flex items-center gap-1 ${isConnected ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                {isConnected ? '🟢 Conectado a Firebase' : '🔴 Sin Conexión'}
              </span>
              <button
                onClick={fetchCloudData}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100"
                title="Forzar sincronización"
              >
                ↻ Sincronizar
              </button>
            </h1>
            <p className="text-muted">Bienvenido, {currentUser?.name}</p>
          </div>
        </div>

        {/* Error Logging Display */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm font-mono">
            🛑 ERROR DIAGNOSTICADO: {errorMsg}
            <br />
            <span className="text-xs text-red-500">Acción sugerida: Revise las 'Security Rules' en la consola de Firebase.</span>
          </div>
        )}
      </header>

      {/* Data Entry Form */}
      {currentUser && (
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-4 text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            {showForm ? '▼ Ocultar Formulario' : '▶ Nuevo Ingreso'}
          </button>

          {showForm && <StudentForm onSuccess={() => {
            setShowForm(false);
            fetchCloudData(); // Re-fetch immediately after save
          }} />}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border-l-4 border-blue-500 shadow-sm">
          <h3 className="text-muted text-sm font-bold uppercase mb-1">Total Estudiantes (Nube)</h3>
          <p className="text-3xl font-bold text-gray-800">
            {loading ? '...' : students.length}
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border-l-4 border-red-500 shadow-sm">
          <h3 className="text-muted text-sm font-bold uppercase mb-1">Casos Críticos</h3>
          <p className="text-3xl font-bold text-red-600">
            {loading ? '...' : highRiskCount}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm overflow-hidden border">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-700">Listado de Casos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-500 font-bold uppercase text-xs border-b">
              <tr>
                <th className="p-4">Estudiante</th>
                <th className="p-4">Carrera</th>
                <th className="p-4">Destino</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? students.map(student => (
                <tr key={student.id} className="border-b last:border-0 hover:bg-blue-50 transition-colors">
                  <td className="p-4 font-medium">
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-bold">{student.name}</span>
                      <span className="text-xs text-muted">{student.matricula}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{student.career}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600 border">
                      {student.destination} {student.destinationDetail ? `(${student.destinationDetail})` : ''}
                    </span>
                  </td>
                  <td className="p-4"><RiskBadge level={student.priority} /></td>
                  <td className="p-4">
                    <Link href={`/student/${student.id}`} className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 font-bold rounded hover:bg-blue-50 text-xs shadow-sm">
                      Ver Detalle
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400 italic">
                    {loading ? 'Cargando datos desde Google Cloud...' : 'No hay registros visibles.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
