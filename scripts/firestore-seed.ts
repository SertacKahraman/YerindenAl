import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';

const sampleProducts = [
    {
        title: 'Taze Köy Sütü',
        price: '25',
        image: 'https://picsum.photos/200',
        description: 'Günlük taze köy sütü, doğal ve katkısız',
        location: 'İstanbul',
        seller: 'Ahmet Çiftçi'
    },
    {
        title: 'Organik Yumurta',
        price: '45',
        image: 'https://picsum.photos/201',
        description: 'Serbest gezen tavuk yumurtası',
        location: 'Ankara',
        seller: 'Mehmet Yılmaz'
    },
    {
        title: 'Taze Süt',
        price: '30',
        image: 'https://picsum.photos/202',
        description: 'Günlük taze süt',
        location: 'İzmir',
        seller: 'Ayşe Demir'
    }
];

async function seed() {
    for (const product of sampleProducts) {
        await addDoc(collection(db, 'products'), product);
        console.log('Eklendi:', product.title);
    }
    console.log('Tüm ürünler başarıyla eklendi!');
}

seed(); 