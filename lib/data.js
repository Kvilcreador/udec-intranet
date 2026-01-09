import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';

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

// --- Firestore Operations (Re-structured) ---

// 1. Fetch Students (Client-side Filtering Strategy)
export async function getStudentsForUser(userEmail) {
  try {
    const user = getUser(userEmail);
    // Authentication Bypass: We don't block locally, we fetch everything first to prove connection.
    // Real security rules should handle this in production, but for this demo, we fetch all.

    console.log("Fetching all students from Cloud...");
    const studentsRef = collection(db, 'students');
    const snapshot = await getDocs(studentsRef);

    const allStudents = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        matricula: data.matricula || data.id,
        id: doc.id
      };
    });

    console.log(`Fetched ${allStudents.length} total records from Cloud.`);

    // Client-side Filtering
    if (!user) return []; // Should not happen if logged in

    if (user.role === 'admin') {
      return allStudents;
    } else if (user.role === 'professional') {
      return allStudents.filter(student => student.destination === user.area);
    }

    return [];
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
}

// 2. Save Student (Add Doc)
export async function addStudent(studentData) {
  try {
    console.log("Initiating Cloud Save...", studentData);
    const docRef = await addDoc(collection(db, 'students'), {
      ...studentData,
      createdAt: new Date(),
      comments: []
    });

    // Success confirmation as requested
    console.log("Data synced to Cloud. ID:", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Cloud Save Failed:", e);
    throw e;
  }
}

// 3. Get Single Student by ID
export async function getStudentById(id) {
  try {
    const docRef = doc(db, 'students', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error fetching single student:", e);
    return null;
  }
}

// 4. Add Comment
export async function addComment(studentAppId, comment) {
  try {
    const studentRef = doc(db, 'students', studentAppId);
    await updateDoc(studentRef, {
      comments: arrayUnion({
        id: Date.now(),
        ...comment,
        date: new Date().toLocaleString()
      })
    });
    console.log("Comment synced to Cloud.");
  } catch (e) {
    console.error("Comment Save Failed:", e);
    throw e;
  }
}
