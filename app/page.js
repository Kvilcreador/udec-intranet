'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getStudentsForUser, syncPendingItems } from '@/lib/data';
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
  const [syncing, setSyncing] = useState(false);

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
      // ... existing error logic
      console.error("Cloud Connection Failed:", error);
      setIsConnected(false);
      let msg = error.message;
      if (msg.includes("permissions")) msg = "Bloqueado por Reglas de Seguridad.";
      else if (msg.includes("offline")) msg = "Sin internet.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPending = async () => {
    setSyncing(true);
    try {
      const result = await syncPendingItems();
      if (result.synced > 0) {
        alert(`✅ Se subieron ${result.synced} fichas a la nube.`);
        fetchCloudData(); // Refresh to see real IDs
      } else if (result.failed > 0) {
        alert(`❌ Falló la subida de ${result.failed} items. Revisa tu conexión.`);
      } else {
        alert("No hay items pendientes.");
      }
    } catch (e) {
      alert("Error al sincronizar: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchCloudData();
  }, [currentUser]);

  const highRiskCount = students.filter(s => s.priority === 'HIGH').length;
  const pendingCount = students.filter(s => s.id && s.id.toString().startsWith('local_')).length;

  return (
    <div className="container">
      <header className="flex flex-col mb-8 gap-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              Panel de Gestión v2.2
              <span className={`text-xs font-bold px-2 py-1 rounded border flex items-center gap-1 ${isConnected ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                {isConnected ? '🟢 Conectado' : '🔴 Offline'}
              </span>
              <button
                onClick={fetchCloudData}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100"
                title="Recargar"
              >
                ↻
              </button>
            </h1>
            <p className="text-muted">Bienvenido, {currentUser?.name}</p>
          </div>

          {/* Manual Sync Button if needed */}
          {pendingCount > 0 && (
            <button
              onClick={handleSyncPending}
              disabled={syncing}
              className="bg-orange-100 text-orange-700 border border-orange-300 px-3 py-2 rounded text-xs font-bold flex items-center gap-2 hover:bg-orange-200 animate-pulse"
            >
              {syncing ? 'Subiendo...' : `📡 Subir ${pendingCount} Pendientes`}
            </button>
          )}
        </div>

        {/* Error Logging Display */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm font-mono">
            Error: {errorMsg}
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
            fetchCloudData(); // Re-fetch immediately
          }} />}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border-l-4 border-blue-500 shadow-sm">
          <h3 className="text-muted text-sm font-bold uppercase mb-1">Total Estudiantes</h3>
          <p className="text-3xl font-bold text-gray-800">
            {loading ? '...' : students.length}
            {pendingCount > 0 && <span className="text-sm text-orange-500 ml-2">({pendingCount} locales)</span>}
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
              {students.length > 0 ? students.map(student => {
                const isLocal = student.id && student.id.toString().startsWith('local_');
                return (
                  <tr key={student.id} className="border-b last:border-0 hover:bg-blue-50 transition-colors">
                    <td className="p-4 font-medium">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-bold flex items-center gap-1">
                          {student.name}
                          {isLocal ? (
                            <span title="Solo guardado en este dispositivo (Pendiente de subir)" className="text-xs cursor-help">💾</span>
                          ) : (
                            <span title="Sincronizado en la nube" className="text-xs text-blue-300 cursor-help">☁️</span>
                          )}
                        </span>
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
                )
              }) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400 italic">
                    {loading ? 'Cargando datos...' : 'No hay registros visibles.'}
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
