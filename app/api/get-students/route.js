import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log("SERVER API: Fetching students...");
        const studentsRef = collection(db, 'students');
        const snapshot = await getDocs(studentsRef);

        const students = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            // Ensure dates are serializable
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : doc.data().createdAt
        }));

        // Disable caching for real-time reads
        return NextResponse.json({ students }, {
            headers: { 'Cache-Control': 'no-store, max-age=0' }
        });
    } catch (error) {
        console.error("SERVER API READ ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
