import { NextResponse } from 'next/server';
import { firestoreAdmin } from '@/lib/firebaseAdmin';

export async function GET() {
    try {
        await firestoreAdmin.collection('test').doc('testDoc').set({ test: 'test' });
        console.log('Firestore Admin SDK is working correctly.');
        return NextResponse.json({ message: 'Firestore Admin SDK is working correctly.' });
    } catch (error) {
        console.error('Firestore Admin SDK error:', error);
        return NextResponse.json({ error: 'Firestore Admin SDK error', details: error }, { status: 500 });
    }
}
