'use client';
// Mock Database and Logic with LocalStorage Persistence

const INITIAL_STUDENTS = [
  {
    id: '20234011',
    name: 'Ana García',
    career: 'Ingeniería Civil',
    antecedents: 'Estudiante presenta dificultades para concentración y refiere problemas familiares recientes que afectan su rendimiento.',
    destination: 'CADE',
    priority: 'HIGH', // Red
    comments: [
      { id: 1, user: 'jourzua@udec.cl', text: 'Se deriva a CADE para apoyo psicopedagógico urgente.', date: '2025-01-08 10:00' },
      { id: 2, user: 'etorres2016@udec.cl', text: 'Recibido. Se agendará hora para mañana.', date: '2025-01-08 11:30' }
    ]
  },
  {
    id: '20259999',
    name: 'Pedro Pascal',
    career: 'Artes Dramáticas',
    antecedents: 'Estudiante refiere ansiedad severa antes de las presentaciones.',
    destination: 'CADE',
    priority: 'MEDIUM', // Yellow (Alerta)
    comments: [],
  },
  {
    id: '20223055',
    name: 'Carlos Diaz',
    career: 'Derecho',
    antecedents: 'Solicita orientación sobre beneficios estudiantiles. No presenta indicadores de riesgo vital.',
    destination: 'DISE',
    priority: 'LOW', // Green
    comments: [],
  },
  {
    id: '20241001',
    name: 'Luisa Martinez',
    career: 'Medicina',
    antecedents: 'Stress elevado por carga académica. Refiere insomnio.',
    destination: 'OTROS',
    destinationDetail: 'Salud Mental Privada',
    priority: 'MEDIUM', // Yellow
    comments: [],
  }
];

const STORAGE_KEY = 'udec_intranet_db_v1';

function getLocalData() {
  if (typeof window === 'undefined') return INITIAL_STUDENTS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize if empty
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
  return INITIAL_STUDENTS;
}

function saveLocalData(data) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

// User Config
const USERS = [
  { email: 'jourzua@udec.cl', name: 'Jonathan Urzúa', role: 'admin', area: 'ALL' },
  { email: 'etorres2016@udec.cl', name: 'Esteban Torres', role: 'professional', area: 'CADE' },
];

export function getUser(email) {
  return USERS.find(u => u.email === email);
}

export function getAllUsers() {
  return USERS;
}

export function getStudentsForUser(userEmail) {
  const user = getUser(userEmail);
  if (!user) return [];

  const allStudents = getLocalData();

  if (user.role === 'admin') {
    return allStudents;
  }

  // Strict filtering for professionals
  return allStudents.filter(s => s.destination === user.area);
}

export function getStudentById(id) {
  const allStudents = getLocalData();
  return allStudents.find(student => student.id === id);
}

export function addStudent(studentData) {
  const currentStudents = getLocalData();
  const updatedStudents = [...currentStudents, { ...studentData, comments: [] }];
  saveLocalData(updatedStudents);
}

export function addComment(studentId, comment) {
  const currentStudents = getLocalData();
  const studentIndex = currentStudents.findIndex(s => s.id === studentId);

  if (studentIndex > -1) {
    const student = currentStudents[studentIndex];
    const newComment = {
      id: Date.now(),
      ...comment,
      date: new Date().toLocaleString()
    };

    // Create new array with updated student
    const updatedStudent = { ...student, comments: [...student.comments, newComment] };
    const updatedStudents = [...currentStudents];
    updatedStudents[studentIndex] = updatedStudent;

    saveLocalData(updatedStudents);
  }
}

