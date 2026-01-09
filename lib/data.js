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
// 1. Fetch Students (Hybrid: Cloud with Local Fallback)
export async function getStudentsForUser(userEmail) {
  const user = getUser(userEmail);
  const localData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('backup_students') || '[]') : [];

  try {
    console.log("Fetching from Cloud...");
    // Race Cloud fetch against a 5-second timer to avoid hanging indefinitely
    const studentsRef = collection(db, 'students');

    // Create the promise but catch errors so Promise.race doesn't reject immediately
    // Wait, Promise.race rejects if the first one rejects.
    // We want to fallback if it fails OR times out.

    const cloudPromise = getDocs(studentsRef).then(snapshot =>
      snapshot.docs.map(doc => ({ ...doc.data(), matricula: doc.data().matricula || doc.data().id, id: doc.id }))
    );

    // Timeout promise
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));

    const cloudStudents = await Promise.race([cloudPromise, timeoutPromise]);
    console.log(`Fetched ${cloudStudents.length} from Cloud.`);

    // Update local backup with fresh cloud data
    if (typeof window !== 'undefined') {
      localStorage.setItem('backup_students', JSON.stringify(cloudStudents));
      console.log("Local backup updated.");
    }

    const allStudents = cloudStudents; // Use cloud data if successful

    // Client-side Filtering
    if (user?.role === 'admin') return allStudents;
    if (user?.role === 'professional') return allStudents.filter(s => s.destination === user.area);
    return [];

  } catch (error) {
    console.warn("Cloud unavailable, switching to Local Backup:", error);

    // Fallback filter
    if (user?.role === 'admin') return localData;
    if (user?.role === 'professional') return localData.filter(s => s.destination === user.area);
    return localData;
  }
}

// 2. Save Student (Hybrid: Try Cloud, Fallback to Local)
export async function addStudent(studentData) {
  const newStudent = {
    ...studentData,
    createdAt: new Date(), // Local date object
    comments: [],
    // Generate a temporary ID if we fall back to local
    id: 'local_' + Date.now()
  };

  try {
    console.log("Initiating Save...", studentData);

    // Race condition: Try to reach Google in 5 seconds. If not, save locally immediately.
    const docRefPromise = addDoc(collection(db, 'students'), { ...newStudent, createdAt: new Date() });
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Save Timeout")), 5000));

    const docRef = await Promise.race([docRefPromise, timeoutPromise]);

    console.log("Data synced to Cloud. ID:", docRef.id);
    return docRef.id;

  } catch (e) {
    console.error("Cloud Save Failed, saving locally for Demo...", e);

    if (typeof window !== 'undefined') {
      const current = JSON.parse(localStorage.getItem('backup_students') || '[]');
      current.push(newStudent); // Newest last
      localStorage.setItem('backup_students', JSON.stringify(current));
    }
    return newStudent.id;
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
