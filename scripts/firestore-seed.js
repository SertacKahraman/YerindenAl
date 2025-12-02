import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase.js';

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
    },
    {
        title: 'Doğal Bal',
        price: '120',
        image: 'https://picsum.photos/203',
        description: 'Köyden doğal çiçek balı',
        location: 'Bursa',
        seller: 'Fatma Kaya'
    },
    {
        title: 'Ev Yapımı Reçel',
        price: '35',
        image: 'https://picsum.photos/204',
        description: 'Mevsim meyvelerinden ev yapımı reçel',
        location: 'Antalya',
        seller: 'Zeynep Güneş'
    },
    {
        title: 'Köy Yumurtası',
        price: '40',
        image: 'https://picsum.photos/205',
        description: 'Doğal köy yumurtası',
        location: 'Konya',
        seller: 'Ali Şahin'
    },
    {
        title: 'Taze Beyaz Peynir',
        price: '80',
        image: 'https://picsum.photos/206',
        description: 'Köy sütünden taze beyaz peynir',
        location: 'Balıkesir',
        seller: 'Emine Yıldız'
    },
    {
        title: 'Organik Domates',
        price: '20',
        image: 'https://picsum.photos/207',
        description: 'Bahçeden taze organik domates',
        location: 'Adana',
        seller: 'Mustafa Demirtaş'
    },
    {
        title: 'Doğal Zeytinyağı',
        price: '150',
        image: 'https://picsum.photos/208',
        description: 'Soğuk sıkım doğal zeytinyağı',
        location: 'Aydın',
        seller: 'Ayhan Korkmaz'
    },
    {
        title: 'Köy Ekmeği',
        price: '18',
        image: 'https://picsum.photos/209',
        description: 'Taş fırında pişmiş köy ekmeği',
        location: 'Eskişehir',
        seller: 'Sevim Aksoy'
    },
    {
        title: 'Taze Salatalık',
        price: '15',
        image: 'https://picsum.photos/210',
        description: 'Bahçeden taze salatalık',
        location: 'Samsun',
        seller: 'Cemal Karaca'
    }
];

const sampleUsers = [
    {
        name: 'Ahmet Çiftçi',
        email: 'ahmetciftci@example.com',
        phone: '+905551112233',
        address: 'İstanbul, Türkiye',
        createdAt: new Date().toISOString()
    },
    {
        name: 'Mehmet Yılmaz',
        email: 'mehmetyilmaz@example.com',
        phone: '+905554445566',
        address: 'Ankara, Türkiye',
        createdAt: new Date().toISOString()
    },
    {
        name: 'Ayşe Demir',
        email: 'aysedemir@example.com',
        phone: '+905557778899',
        address: 'İzmir, Türkiye',
        createdAt: new Date().toISOString()
    },
    {
        name: 'Fatma Kaya',
        email: 'fatmakaya@example.com',
        phone: '+905550001122',
        address: 'Bursa, Türkiye',
        createdAt: new Date().toISOString()
    },
    {
        name: 'Zeynep Güneş',
        email: 'zeynepgunes@example.com',
        phone: '+905553334455',
        address: 'Antalya, Türkiye',
        createdAt: new Date().toISOString()
    }
];

async function seed() {
    for (const product of sampleProducts) {
        await addDoc(collection(db, 'products'), product);
        console.log('Ürün eklendi:', product.title);
    }
    for (const user of sampleUsers) {
        await addDoc(collection(db, 'users'), user);
        console.log('Kullanıcı eklendi:', user.name);
    }
    console.log('Tüm ürünler ve kullanıcılar başarıyla eklendi!');
}

seed(); 