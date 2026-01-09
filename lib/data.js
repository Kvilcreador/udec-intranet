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

    // MERGE STRATEGY: Combine Cloud Data + Unsynced Local Data
    let mergedData = cloudStudents;

    if (typeof window !== 'undefined') {
      const currentLocal = JSON.parse(localStorage.getItem('backup_students') || '[]');
      // Identify items that exist ONLY locally (start with 'local_')
      const unsyncedItems = currentLocal.filter(s => s.id && s.id.toString().startsWith('local_'));

      if (unsyncedItems.length > 0) {
        console.log(`Restoring ${unsyncedItems.length} unsynced items from local storage.`);
        // Combine: Unsynced First + Cloud Data
        mergedData = [...unsyncedItems, ...cloudStudents];
      }

      // Save the COMPLETE snapshot (Cloud + Local) back to storage for offline use
      localStorage.setItem('backup_students', JSON.stringify(mergedData));
    }

    const allStudents = mergedData;

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
// 5. Sync Pending Items (Manual Trigger)
export async function syncPendingItems() {
  if (typeof window === 'undefined') return { synced: 0, failed: 0 };

  const current = JSON.parse(localStorage.getItem('backup_students') || '[]');
  const pending = current.filter(s => s.id && s.id.toString().startsWith('local_'));

  if (pending.length === 0) return { synced: 0, failed: 0 };

  let syncedCount = 0;
  let failedCount = 0;
  let lastError = null;
  let updatedList = [...current];

  for (const item of pending) {
    try {
      // Prepare clean data
      const { id, ...dataToSave } = item;

      // SANITIZATION: Fix potential Date issues
      if (dataToSave.createdAt) {
        const d = new Date(dataToSave.createdAt);
        dataToSave.createdAt = !isNaN(d.getTime()) ? d : new Date();
      } else {
        dataToSave.createdAt = new Date();
      }

      console.log(`Attempting to upload pending item: ${id}`);

      const addDocPromise = addDoc(collection(db, 'students'), {
        ...dataToSave,
        serverSyncedAt: new Date()
      });
      // Increased Timeout to 30 seconds
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Espera mayor a 30s (Timeout networking)")), 30000));

      const docRef = await Promise.race([addDocPromise, timeoutPromise]);

      console.log(`Synced local item ${id} -> Cloud ID ${docRef.id}`);

      // Update the local item with the Real ID so it's no longer considered "Pending"
      updatedList = updatedList.map(s => s.id === id ? { ...s, id: docRef.id } : s);

      syncedCount++;
    } catch (e) {
      console.error(`Failed to sync ${item.id}`, e);
      failedCount++;
      lastError = e.message;
    }
  }

  // Save updated state (Pending items became Real items)
  localStorage.setItem('backup_students', JSON.stringify(updatedList));

  return { synced: syncedCount, failed: failedCount, lastError };
}
