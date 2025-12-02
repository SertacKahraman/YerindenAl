import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function getOrCreateChat(userId1: string, userId2: string, productId?: string) {
    const chatsRef = collection(db, 'chats');
    const q = query(
        chatsRef,
        where('users', 'array-contains', userId1)
    );
    const querySnapshot = await getDocs(q);
    let chat = null;
    querySnapshot.forEach(doc => {
        const data = doc.data();
        if (
            data.users.includes(userId2) &&
            (!productId || data.productId === productId)
        ) {
            chat = { id: doc.id, ...data };
        }
    });

    if (chat) return chat;

    // Yoksa yeni chat oluştur
    const newChat = {
        users: [userId1, userId2],
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        ...(productId ? { productId } : {}),
    };
    const docRef = await addDoc(chatsRef, newChat);
    return { id: docRef.id, ...newChat };
} 