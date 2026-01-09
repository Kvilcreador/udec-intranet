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

// 1. Fetch Students (Hybrid: Proxy API with Aggressive Timeout)
export async function getStudentsForUser(userEmail) {
  const user = getUser(userEmail);
  const localData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('backup_students') || '[]') : [];

  try {
    console.log("Fetching from Cloud via API Proxy...");

    // RACE: Fetch vs 4s Timeout
    // If the network is slow, Show Local Data immediately!
    const fetchPromise = fetch('/api/get-students', { cache: 'no-store' });
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Read Timeout (4s)")), 4000));

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) throw new Error(`API Fetch Failed: ${response.status}`);

    const data = await response.json();
    const cloudStudents = (data.students || []).map(s => ({
      ...s,
      matricula: s.matricula || s.id
    }));

    console.log(`Fetched ${cloudStudents.length} from Cloud.`);

    // MERGE STRATEGY
    let mergedData = cloudStudents;
    if (typeof window !== 'undefined') {
      const currentLocal = JSON.parse(localStorage.getItem('backup_students') || '[]');
      const unsyncedItems = currentLocal.filter(s => s.id && s.id.toString().startsWith('local_'));
      if (unsyncedItems.length > 0) {
        mergedData = [...unsyncedItems, ...cloudStudents];
      }
      localStorage.setItem('backup_students', JSON.stringify(mergedData));
    }

    const allStudents = mergedData;
    if (user?.role === 'admin') return allStudents;
    if (user?.role === 'professional') return allStudents.filter(s => s.destination === user.area);
    return [];

  } catch (error) {
    console.warn("Cloud slow/unavailable, showing Local Data:", error);
    // Return Local Data immediately if Cloud is slow
    if (user?.role === 'admin') return localData;
    if (user?.role === 'professional') return localData.filter(s => s.destination === user.area);
    return localData;
  }
}

// 2. Save Student (OPTIMISTIC: Local First, Background Sync)
export async function addStudent(studentData) {
  const newStudent = {
    ...studentData,
    createdAt: new Date(),
    comments: [],
    id: 'local_' + Date.now() // Temporary Local ID
  };

  console.log("OPTIMISTIC SAVE: Saving locally first...", newStudent.id);

  // 1. ALWAYS Save to Local Storage Immediately
  if (typeof window !== 'undefined') {
    const current = JSON.parse(localStorage.getItem('backup_students') || '[]');
    current.push(newStudent);
    localStorage.setItem('backup_students', JSON.stringify(current));
  }

  // 2. Trigger Background Sync (Fire & Forget - Do NOT make user wait)
  // We don't await this. The UI will show the "Saved" state immediately.
  // The 'syncPendingItems' function will upgrade the ID to a Cloud ID later.
  syncPendingItems().catch(err => console.error("Background Sync Failed:", err));

  // 3. Return immediately so UI feels instant
  return newStudent.id;
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

// 5. Sync Pending Items (Manual Trigger via API Proxy)
export async function syncPendingItems() {
  if (typeof window === 'undefined') return { synced: 0, failed: 0, lastError: null };

  const current = JSON.parse(localStorage.getItem('backup_students') || '[]');
  const pending = current.filter(s => s.id && s.id.toString().startsWith('local_'));

  if (pending.length === 0) return { synced: 0, failed: 0, lastError: null };

  let syncedCount = 0;
  let failedCount = 0;
  let lastError = null;
  let updatedList = [...current];

  for (const item of pending) {
    try {
      const { id, ...dataToSave } = item;

      // Sanitization: Flatten Date for JSON transport
      if (typeof dataToSave.createdAt === 'object' && dataToSave.createdAt !== null) {
        dataToSave.createdAt = dataToSave.createdAt.toISOString ? dataToSave.createdAt.toISOString() : new Date().toISOString();
      } else if (typeof dataToSave.createdAt === 'string') {
        // ensure valid string or valid date
        // leave as string, server will handle
      } else {
        dataToSave.createdAt = new Date().toISOString();
      }

      console.log(`Attempting to upload pending item via API Proxy: ${id}`);

      // USE API PROXY instead of direct Firestore connection to BYPASS FIREWALLS
      const response = await fetch('/api/save-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Error Servidor: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Synced local item ${id} -> Cloud ID ${result.id}`);

      // Update the local item with the Real ID
      updatedList = updatedList.map(s => s.id === id ? { ...s, id: result.id } : s);

      syncedCount++;
    } catch (e) {
      console.error(`Failed to sync ${item.id}`, e);
      failedCount++;
      lastError = e.message;
    }
  }

  // Save updated state
  localStorage.setItem('backup_students', JSON.stringify(updatedList));

  return { synced: syncedCount, failed: failedCount, lastError };
}
