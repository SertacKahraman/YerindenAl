import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
    apiKey: "AIzaSyA0G1Z5vnm5w8VyjTolrzksN8VXjWbJn4o",
    authDomain: "yerindenal-b4943.firebaseapp.com",
    projectId: "yerindenal-b4943",
    storageBucket: "yerindenal-b4943.appspot.com",
    messagingSenderId: "1057897807567",
    appId: "1:1057897807567:web:680a5f5400e520a212c1ba",
    measurementId: "G-FWXNJXV08N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 