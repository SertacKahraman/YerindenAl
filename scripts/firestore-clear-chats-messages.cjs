const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');
const { firebaseConfig } = require('../config/firebase');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCollection(collName) {
    const colRef = collection(db, collName);
    const snap = await getDocs(colRef);
    let count = 0;
    for (const d of snap.docs) {
        await deleteDoc(doc(db, collName, d.id));
        count++;
    }
    console.log(`${collName} koleksiyonundan ${count} belge silindi.`);
}

(async () => {
    await clearCollection('chats');
    await clearCollection('messages');
    console.log('Tüm chats ve messages koleksiyonları temizlendi!');
    process.exit(0);
})(); 