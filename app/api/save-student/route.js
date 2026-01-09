import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const data = await request.json();

        // Server-side validation/sanitization
        if (data.createdAt) {
            data.createdAt = new Date(data.createdAt);
        } else {
            data.createdAt = new Date();
        }

        // Add server timestamp
        data.serverProcessedAt = new Date();

        console.log("SERVER API: Attempting to save student...", data.name);

        // Direct Firestore write from the Server (bypassing Client Network)
        const docRef = await addDoc(collection(db, 'students'), data);

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error) {
        console.error("SERVER API ERROR:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
