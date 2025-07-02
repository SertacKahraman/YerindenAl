import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

const imageMap = {
    'süt': [
        'https://images.pexels.com/photos/416656/pexels-photo-416656.jpeg',
        'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg',
        'https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg',
        'https://images.pexels.com/photos/14105/pexels-photo-14105.jpeg'
    ],
    'yumurta': [
        'https://images.pexels.com/photos/162712/eggs-egg-carton-chicken-eggs-food-162712.jpeg',
        'https://images.pexels.com/photos/3645371/pexels-photo-3645371.jpeg',
        'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg',
        'https://images.pexels.com/photos/161887/pexels-photo-161887.jpeg'
    ],
    'bal': [
        'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        'https://images.pexels.com/photos/128402/pexels-photo-128402.jpeg',
        'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg'
    ],
    'domates': [
        'https://images.pexels.com/photos/839725/pexels-photo-839725.jpeg',
        'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg',
        'https://images.pexels.com/photos/257816/pexels-photo-257816.jpeg'
    ],
    'peynir': [
        'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        'https://images.pexels.com/photos/209339/pexels-photo-209339.jpeg',
        'https://images.pexels.com/photos/533343/pexels-photo-533343.jpeg'
    ],
    'reçel': [
        'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        'https://images.pexels.com/photos/533343/pexels-photo-533343.jpeg'
    ],
    'zeytinyağı': [
        'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        'https://images.pexels.com/photos/533343/pexels-photo-533343.jpeg'
    ],
    'ekmek': [
        'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        'https://images.pexels.com/photos/533343/pexels-photo-533343.jpeg'
    ],
    'salatalık': [
        'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        'https://images.pexels.com/photos/533343/pexels-photo-533343.jpeg'
    ],
    'fasulye': [
        'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        'https://images.pexels.com/photos/533343/pexels-photo-533343.jpeg'
    ],
    'elma': [
        'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg',
        'https://images.pexels.com/photos/209339/pexels-photo-209339.jpeg',
        'https://images.pexels.com/photos/533343/pexels-photo-533343.jpeg'
    ],
    'zeytin': [
        'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
        'https://images.pexels.com/photos/533343/pexels-photo-533343.jpeg'
    ]
};

const cityList = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya', 'Adana', 'Trabzon', 'Samsun', 'Gaziantep',
    'Kayseri', 'Mersin', 'Balıkesir', 'Aydın', 'Manisa', 'Eskişehir', 'Kocaeli', 'Sakarya', 'Denizli', 'Muğla'
];

const sellers = [
    'Ahmet Çiftçi', 'Mehmet Yılmaz', 'Ayşe Demir', 'Fatma Kaya', 'Zeynep Güneş',
    'Ali Şahin', 'Emine Yıldız', 'Mustafa Demirtaş', 'Ayhan Korkmaz', 'Sevim Aksoy',
    'Cemal Karaca', 'Hasan Kaya', 'Mustafa Arıcı', 'Ayşe Yıldız', 'Ali Demir'
];

const descMap = {
    'süt': [
        'Günlük taze köy sütü, katkısız ve doğal.',
        'Organik inek sütü, sabah sağımdan.',
        'Tam yağlı, lezzetli ve taze süt. Çocuklar için ideal.'
    ],
    'yumurta': [
        'Serbest gezen tavuk yumurtası.',
        'Köyden taze, doğal yumurta.',
        'Organik, iri boy yumurtalar.'
    ],
    'bal': [
        'Köyden doğal çiçek balı.',
        'Yüksek rakım yayla balı.',
        'Katkısız, saf ve lezzetli bal.'
    ],
    'domates': [
        'Bahçeden taze organik domates.',
        'Kokulu, sulu ve doğal domates.',
        'Mevsiminde toplanmış domates.'
    ],
    'peynir': [
        'Köy sütünden taze beyaz peynir.',
        'Doğal, katkısız köy peyniri.',
        'Tam yağlı, lezzetli beyaz peynir.'
    ],
    'reçel': [
        'Mevsim meyvelerinden ev yapımı reçel.',
        'Katkısız, doğal reçel.',
        'Kahvaltıların vazgeçilmezi ev reçeli.'
    ],
    'zeytinyağı': [
        'Soğuk sıkım doğal zeytinyağı.',
        'Erken hasat, natürel sızma zeytinyağı.',
        'Köyden taze zeytinyağı.'
    ],
    'ekmek': [
        'Taş fırında pişmiş köy ekmeği.',
        'Odun ateşinde doğal ekmek.',
        'Köy usulü, katkısız ekmek.'
    ],
    'salatalık': [
        'Bahçeden taze salatalık.',
        'Kıtır kıtır, doğal salatalık.',
        'Mevsiminde toplanmış salatalık.'
    ],
    'fasulye': [
        'Günlük toplanmış taze fasulye.',
        'Köyden doğal fasulye.',
        'Lezzetli ve taze fasulye.'
    ],
    'elma': [
        "Isparta'dan taze elma.",
        'Kırmızı, sulu ve tatlı elma.',
        'Doğal, katkısız elma.'
    ],
    'zeytin': [
        'Köyden doğal zeytin.',
        'Siyah ve yeşil zeytin karışık.',
        'Kahvaltılık, iri taneli zeytin.'
    ]
};

const unitMap = [
    { keyword: 'süt', unit: 'Litre' },
    { keyword: 'yumurta', unit: 'Adet' },
    { keyword: 'bal', unit: 'Kavanoz' },
    { keyword: 'domates', unit: 'Kg' },
    { keyword: 'peynir', unit: 'Kg' },
    { keyword: 'reçel', unit: 'Kavanoz' },
    { keyword: 'zeytinyağı', unit: 'Litre' },
    { keyword: 'ekmek', unit: 'Adet' },
    { keyword: 'salatalık', unit: 'Kg' },
    { keyword: 'fasulye', unit: 'Kg' },
    { keyword: 'elma', unit: 'Kg' },
    { keyword: 'zeytin', unit: 'Kg' }
];

function getImageForTitle(title, usedImages) {
    if (!title) return imageMap['süt'][0];
    const lower = title.toLowerCase();
    for (const key in imageMap) {
        if (lower.includes(key)) {
            // Kullanılmamış bir görsel bul
            const available = imageMap[key].filter(url => !usedImages[key]?.includes(url));
            if (available.length > 0) {
                const url = available[Math.floor(Math.random() * available.length)];
                usedImages[key] = [...(usedImages[key] || []), url];
                return url;
            } else {
                // Hepsi kullanıldıysa rastgele birini ata
                const url = imageMap[key][Math.floor(Math.random() * imageMap[key].length)];
                usedImages[key] = [...(usedImages[key] || []), url];
                return url;
            }
        }
    }
    return imageMap['süt'][0];
}

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPrice(title) {
    const lower = title.toLowerCase();
    if (lower.includes('süt')) return Math.round(10 + Math.random() * 20).toString();
    if (lower.includes('yumurta')) return Math.round(30 + Math.random() * 30).toString();
    if (lower.includes('bal')) return Math.round(80 + Math.random() * 100).toString();
    if (lower.includes('domates')) return Math.round(10 + Math.random() * 20).toString();
    if (lower.includes('peynir')) return Math.round(60 + Math.random() * 40).toString();
    if (lower.includes('reçel')) return Math.round(20 + Math.random() * 30).toString();
    if (lower.includes('zeytinyağı')) return Math.round(100 + Math.random() * 80).toString();
    if (lower.includes('ekmek')) return Math.round(10 + Math.random() * 10).toString();
    if (lower.includes('salatalık')) return Math.round(8 + Math.random() * 10).toString();
    if (lower.includes('fasulye')) return Math.round(15 + Math.random() * 10).toString();
    if (lower.includes('elma')) return Math.round(8 + Math.random() * 10).toString();
    if (lower.includes('zeytin')) return Math.round(30 + Math.random() * 20).toString();
    return Math.round(20 + Math.random() * 80).toString();
}

function getRandomDesc(title) {
    const lower = title.toLowerCase();
    for (const key in descMap) {
        if (lower.includes(key)) return getRandom(descMap[key]);
    }
    return 'Doğal ve taze ürün.';
}

function getUnitForTitle(title) {
    if (!title) return 'Adet';
    const lower = title.toLowerCase();
    for (const { keyword, unit } of unitMap) {
        if (lower.includes(keyword)) return unit;
    }
    return 'Adet';
}

async function fixProductsAndComments() {
    // Kullanıcıları çek ve isim-id eşlemesi yap
    const userSnapshot = await getDocs(collection(db, 'users'));
    const userMap = {};
    userSnapshot.forEach(userDoc => {
        const data = userDoc.data();
        if (data.name) {
            userMap[data.name] = { id: userDoc.id, name: data.name };
        }
    });

    // Ürünleri güncelle
    const productSnapshot = await getDocs(collection(db, 'products'));
    for (const productDoc of productSnapshot.docs) {
        const data = productDoc.data();
        let seller = data.seller;
        // Eğer seller bir string ise, userMap'ten nesneye çevir
        if (typeof seller === 'string' && userMap[seller]) {
            seller = userMap[seller];
        }
        // Eğer seller bir string ve userMap'te yoksa ürünü sil
        if (typeof seller === 'string' && !userMap[seller]) {
            await deleteDoc(doc(db, 'products', productDoc.id));
            console.log('Silindi (eşleşmeyen satıcı):', data.title, seller);
            continue;
        }
        // Eğer seller zaten nesne ise dokunma
        await updateDoc(doc(db, 'products', productDoc.id), {
            seller: seller
        });
        console.log('Güncellendi:', data.title, seller);
    }

    // Yorumları kontrol et
    const commentSnapshot = await getDocs(collection(db, 'comments'));
    for (const commentDoc of commentSnapshot.docs) {
        const data = commentDoc.data();
        // userId gerçek kullanıcıya ait mi?
        if (data.userId && !Object.values(userMap).find(u => u.id === data.userId)) {
            await deleteDoc(doc(db, 'comments', commentDoc.id));
            console.log('Yorum silindi (geçersiz userId):', data.comment);
        }
        // productId geçerli mi? (ürün silindiyse yorumu da sil)
        if (data.productId && !productSnapshot.docs.find(p => p.id === data.productId)) {
            await deleteDoc(doc(db, 'comments', commentDoc.id));
            console.log('Yorum silindi (geçersiz productId):', data.comment);
        }
    }
    console.log('Tüm ürünler ve yorumlar entegre edildi!');
}

async function standardizeUsers() {
    const userSnapshot = await getDocs(collection(db, 'users'));
    for (const userDoc of userSnapshot.docs) {
        const data = userDoc.data();
        const updates = {};
        if (!data.photoURL) updates.photoURL = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.name || 'Kullanıcı');
        if (!data.createdAt) updates.createdAt = new Date().toISOString();
        if (!data.address) updates.address = 'Bilinmiyor';
        if (!data.phone) updates.phone = '';
        // Eğer güncellenecek bir şey varsa update et
        if (Object.keys(updates).length > 0) {
            await updateDoc(doc(db, 'users', userDoc.id), updates);
            console.log('Kullanıcı güncellendi:', data.name, updates);
        }
    }
    console.log('Tüm kullanıcılar standart hale getirildi!');
}

// Entegre fonksiyonları sırayla çalıştır
async function runAllMigrations() {
    await standardizeUsers();
    await fixProductsAndComments();
}

runAllMigrations(); 