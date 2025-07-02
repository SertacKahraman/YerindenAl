import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA0G1Z5vnm5w8VyjTolrzksN8VXjWbJn4o",
    authDomain: "yerindenal-b4943.firebaseapp.com",
    projectId: "yerindenal-b4943",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const comments = [
    {
        productId: '1',
        userId: 'user1',
        userName: 'Ahmet Yılmaz',
        rating: 5,
        comment: 'Ürün çok taze ve lezzetliydi, tavsiye ederim!',
        createdAt: Timestamp.now(),
    },
    {
        productId: '1',
        userId: 'user2',
        userName: 'Fatma Kaya',
        rating: 4,
        comment: 'Hızlı teslimat, ürün güzel.',
        createdAt: Timestamp.now(),
    },
    {
        productId: '2',
        userId: 'user3',
        userName: 'Mehmet Demir',
        rating: 3,
        comment: 'Yumurta biraz küçük geldi ama lezzetli.',
        createdAt: Timestamp.now(),
    },
];

async function seedComments() {
    for (const c of comments) {
        await addDoc(collection(db, 'comments'), c);
        console.log('Yorum eklendi:', c);
    }
    console.log('Tüm örnek yorumlar eklendi!');
}

seedComments(); 