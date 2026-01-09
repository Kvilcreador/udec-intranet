import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, arrayUnion, getDoc } from 'firebase/firestore';

// User Config (Static for Auth simulation)
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

// --- Firestore Operations ---

// 1. Fetch Students (with strict filtering)
export async function getStudentsForUser(userEmail) {
  const user = getUser(userEmail);
  if (!user) return [];

  const studentsRef = collection(db, 'students');
  let q;

  if (user.role === 'admin') {
    // Admins see everything
    q = query(studentsRef);
  } else if (user.role === 'professional') {
    // Professionals only see their area
    q = query(studentsRef, where("destination", "==", user.area));
  } else {
    return [];
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      matricula: data.matricula || data.id, // Normalize matricula
      id: doc.id // Force Firestore ID (overwrites data.id if present)
    };
  });
}

// 2. Add New Student
export async function addStudent(studentData) {
  try {
    console.log("Intentando guardar estudiante en Firestore...", studentData);
    const docRef = await addDoc(collection(db, 'students'), {
      ...studentData,
      createdAt: new Date(),
      comments: [] // Initialize empty comments array
    });
    console.log("Estudiante guardado con éxito. ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding student: ", e);
    throw e;
  }
}

// 3. Get Single Student by ID
export async function getStudentById(id) {
  const docRef = doc(db, 'students', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
}

// 4. Add Comment
export async function addComment(studentAppId, comment) {
  // studentAppId MUST be the Firestore Document ID.
  // In the migration, we must ensure existing components pass the document ID, not the matricula.

  const studentRef = doc(db, 'students', studentAppId);

  await updateDoc(studentRef, {
    comments: arrayUnion({
      id: Date.now(), // Simple unique ID for the comment itself
      ...comment,
      date: new Date().toLocaleString()
    })
  });
}
