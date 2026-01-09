'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUser } from '@/lib/data';
import RiskBadge from '@/components/ui/RiskBadge';
import Link from 'next/link';
import StudentForm from '@/components/dashboard/StudentForm';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Real-time listener
  useEffect(() => {
    if (!currentUser) return;

    const user = getUser(currentUser.email); // Get full user details including role/area
    if (!user) return;

    console.log("Setting up snapshot listener for:", user.email, user.role);

    const studentsRef = collection(db, 'students');
    let q;

    if (user.role === 'admin') {
      q = query(studentsRef);
    } else if (user.role === 'professional') {
      q = query(studentsRef, where("destination", "==", user.area));
    } else {
      setStudents([]);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Snapshot received! Docs count:", snapshot.docs.length);
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          ...d,
          matricula: d.matricula || d.id, // Normalize matricula
          id: doc.id // Force Firestore ID
        };
      }).sort((a, b) => {
        // Sort descending (newest first) - handling Firestore Timestamps
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      setStudents(data);
    }, (error) => {
      console.error("Snapshot error:", error);
      alert("Error de conexión con la Base de Datos: " + error.message + "\n\nVerifique que las 'Reglas de Seguridad' en Firebase permitan el acceso.");
    });

    return () => unsubscribe();
  }, [currentUser]);



  const highRiskCount = students.filter(s => s.priority === 'HIGH').length;

  const testConnection = async () => {
    try {
      const { addDoc, collection, getDocs, query, limit } = await import('firebase/firestore');
      const testRef = collection(db, 'connectivity_logs');

      // 1. Write Test
      const docRef = await addDoc(testRef, {
        timestamp: new Date(),
        device: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      });

      // 2. Read Test
      const q = query(testRef, limit(1));
      const snapshot = await getDocs(q);

      alert(`✅ DIAGNÓSTICO EXITOSO:\n\nEscritura: OK (ID: ${docRef.id})\nLectura: OK (Docs: ${snapshot.size})\n\nConexión con Google correcta.`);

    } catch (e) {
      alert(`❌ FALLO DE DIAGNÓSTICO:\n${e.message}\n\nPosible bloqueo de red o permisos.`);
    }
  };

  return (
    <div className="container">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            Panel de Gestión
            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500 border" title="Registros en Base de Datos">
              DB: {students.length}
            </span>
            <button
              onClick={testConnection}
              className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded border border-purple-100 hover:bg-purple-100"
            >
              ⚡ Probar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100"
              title="Forzar recarga completa"
            >
              ↻
            </button>
          </h1>
          <p className="text-muted">Bienvenido, {currentUser?.name}</p>
        </div>
      </header>

      {/* Data Entry Form: Available for all logged in users for the persistent test */}
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
          }} />}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border-l-4 border-blue-500 shadow-sm">
          <h3 className="text-muted text-sm font-bold uppercase mb-1">Total Estudiantes Visibles</h3>
          <p className="text-3xl font-bold text-gray-800">{students.length}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border-l-4 border-red-500 shadow-sm">
          <h3 className="text-muted text-sm font-bold uppercase mb-1">Casos Críticos</h3>
          <p className="text-3xl font-bold text-red-600">{highRiskCount}</p>
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
                    No hay estudiantes asignados a su vista.
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
