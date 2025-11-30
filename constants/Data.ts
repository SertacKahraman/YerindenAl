
export const cities = [
    'Tüm Türkiye',
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
    'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
    'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane',
    'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli',
    'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş',
    'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
    'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
    'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

export const categories = [
    'Tüm Kategoriler',
    'Süt Ürünleri',
    'Yumurta',
    'Sebze',
    'Meyve',
    'Et Ürünleri',
    'Bal',
    'Zeytin',
    'Peynir',
    'Doğal Ürünler',
    'Tahıl',
    'Kuruyemiş'
];

export const popularSearches = [
    'Yumurta',
    'Süt',
    'Peynir',
    'Domates',
    'Bal',
    'Zeytinyağı',
    'Tereyağı',
    'Patates'
];

export const mainCategories = [
    { id: 'hayvancilik', name: 'Hayvancılık', icon: '🐄' },
    { id: 'tarim', name: 'Tarım Ürünleri', icon: '🌱' },
    { id: 'hayvansal', name: 'Hayvansal Ürünler', icon: '🥛' },
    { id: 'dogal', name: 'Doğal Ürünler', icon: '🍯' },
    { id: 'yem', name: 'Yem ve Gübre', icon: '🌿' },
    { id: 'makine', name: 'Tarım Makineleri', icon: '🚜' },
    { id: 'ekipman', name: 'Çiftlik Ekipmanları', icon: '🏠' }
];

export const detailedCategories = {
    'hayvancilik': {
        'Büyükbaş Hayvanlar': {
            'Sığır': ['Holstein (Siyah-beyaz)', 'Simental', 'Angus', 'Limousin', 'Charolais', 'Jersey', 'Yerli Kara', 'Boz Irk', 'Güney Anadolu Kırmızısı', 'Doğu Anadolu Kırmızısı', 'Yerli Kara (Ankara)', 'Boz Irk (Ankara)'],
            'Manda': ['Anadolu Mandası', 'İtalyan Mandası']
        },
        'Küçükbaş Hayvanlar': {
            'Koyun': ['Merinos', 'İvesi', 'Akkaraman', 'Morkaraman', 'Karayaka', 'Dağlıç', 'Sakız', 'Kıvırcık', 'Chios', 'Assaf'],
            'Keçi': ['Saanen', 'Toggenburg', 'Alpin', 'Maltız', 'Kilis', 'Honamlı', 'Ankara Keçisi (Tiftik)', 'Hair Goat (Kıl Keçisi)']
        },
        'Kümes Hayvanları': {
            'Tavuk': ['Yumurta Tavuğu (Lohman, Hy-Line, ISA Brown)', 'Et Tavuğu (Broiler, Cobb, Ross)', 'Yerli Tavuk (Denizli, Gerze, Sultan)'],
            'Hindi': ['Bronz Hindi', 'Beyaz Hindi', 'Siyah Hindi'],
            'Ördek': ['Pekin Ördeği', 'Muscovy Ördeği', 'Runner Ördeği'],
            'Kaz': ['Emden Kazı', 'Toulouse Kazı', 'Çin Kazı'],
            'Bıldırcın': ['Japon Bıldırcını', 'Bobwhite Bıldırcını']
        },
        'Ev Hayvanları': {
            'Kedi': ['Tekir', 'Van Kedisi', 'Ankara Kedisi', 'Persian', 'British Shorthair'],
            'Köpek': ['Kangal', 'Akbash', 'Malaklı', 'Çoban Köpeği', 'Av Köpeği', 'Ev Köpeği']
        },
        'Su Ürünleri': {
            'Balık': ['Alabalık', 'Sazan', 'Levrek', 'Çipura', 'Tilapia', 'Yayın Balığı'],
            'Diğer': ['Karides', 'Midye']
        }
    },
    'tarim': {
        'Tahıllar ve Baklagiller': {
            'Buğday': ['Ekmeklik Buğday', 'Makarnalık Buğday', 'Durum Buğdayı'],
            'Arpa': ['Yemlik Arpa', 'Malt Arpası'],
            'Mısır': ['Yemlik Mısır', 'Silajlık Mısır', 'Tatlı Mısır'],
            'Diğer Tahıllar': ['Çeltik (Pirinç)', 'Yulaf', 'Çavdar', 'Tritikale'],
            'Baklagiller': ['Nohut', 'Mercimek (Kırmızı, Yeşil)', 'Fasulye', 'Bezelye', 'Bakla', 'Burçak', 'Fiğ']
        },
        'Endüstriyel Bitkiler': {
            'Tekstil': ['Pamuk'],
            'Şeker': ['Şeker Pancarı'],
            'Yağlı Tohumlar': ['Ayçiçeği', 'Soya', 'Kanola', 'Susam'],
            'Diğer': ['Haşhaş', 'Tütün']
        },
        'Sebzeler': {
            'Yapraklı Sebzeler': ['Marul', 'Ispanak', 'Pazı', 'Lahana', 'Roka', 'Maydanoz', 'Dereotu', 'Nane'],
            'Kök Sebzeler': ['Patates', 'Soğan', 'Sarımsak', 'Havuç', 'Turp', 'Pancar', 'Şalgam'],
            'Meyve Sebzeler': ['Domates', 'Biber', 'Patlıcan', 'Kabak', 'Salatalık', 'Bamya'],
            'Baklagil Sebzeler': ['Taze Fasulye', 'Bezelye', 'Bakla']
        },
        'Meyveler': {
            'Yumuşak Çekirdekli Meyveler': ['Elma', 'Armut', 'Ayva'],
            'Sert Çekirdekli Meyveler': ['Şeftali', 'Kayısı', 'Erik', 'Kiraz', 'Vişne', 'Badem'],
            'Turunçgiller': ['Portakal', 'Limon', 'Mandalina', 'Greyfurt'],
            'Tropikal Meyveler': ['Muz', 'Avokado', 'Mango'],
            'Üzüm': ['Sofralık Üzüm', 'Şaraplık Üzüm', 'Kurutmalık Üzüm'],
            'Diğer Meyveler': ['İncir', 'Nar', 'Zeytin', 'Ceviz', 'Fındık', 'Antep Fıstığı', 'Kestane']
        }
    },
    'hayvansal': {
        'Süt ve Süt Ürünleri': {
            'Süt': ['İnek Sütü', 'Keçi Sütü', 'Koyun Sütü', 'Manda Sütü'],
            'Peynir': ['Beyaz Peynir', 'Kaşar Peyniri', 'Tulum Peyniri', 'Lor Peyniri', 'Çökelek', 'Ezine Peyniri', 'Mihaliç Peyniri', 'Örgü Peyniri'],
            'Diğer': ['Yoğurt', 'Tereyağı', 'Kaymak', 'Ayran']
        },
        'Et ve Et Ürünleri': {
            'Kırmızı Et': ['Dana Eti', 'Koyun Eti', 'Keçi Eti', 'Manda Eti'],
            'Beyaz Et': ['Tavuk Eti', 'Hindi Eti', 'Ördek Eti', 'Kaz Eti'],
            'Et Ürünleri': ['Sucuk', 'Sosis', 'Pastırma', 'Kavurma', 'Salam']
        },
        'Yumurta': {
            'Yumurta Türleri': ['Tavuk Yumurtası', 'Hindi Yumurtası', 'Ördek Yumurtası', 'Kaz Yumurtası', 'Bıldırcın Yumurtası']
        }
    },
    'dogal': {
        'Bal ve Arıcılık': {
            'Bal': ['Çiçek Balı', 'Çam Balı', 'Kestane Balı', 'Ayçiçek Balı', 'Lavanta Balı', 'Ihlamur Balı'],
            'Arı Ürünleri': ['Polen', 'Propolis', 'Arı Sütü', 'Bal Mumu']
        },
        'Zeytin ve Zeytinyağı': {
            'Zeytin': ['Yeşil Zeytin', 'Siyah Zeytin', 'Gemlik Zeytini', 'Edremit Zeytini'],
            'Zeytinyağı': ['Natürel Sızma', 'Natürel Birinci', 'Natürel İkinci']
        },
        'Kuruyemişler': {
            'Kuruyemiş': ['Ceviz', 'Fındık', 'Badem', 'Antep Fıstığı', 'Kestane', 'Leblebi']
        }
    },
    'yem': {
        'Yemler': {
            'Kaba Yemler': ['Saman', 'Ot', 'Silaj', 'Yonca', 'Fiğ'],
            'Konsantre Yemler': ['Arpa', 'Mısır', 'Buğday', 'Soya Küspesi', 'Ayçiçeği Küspesi']
        },
        'Gübreler': {
            'Organik Gübreler': ['Ahır Gübresi', 'Kompost', 'Yeşil Gübre'],
            'Kimyasal Gübreler': ['Azotlu Gübreler', 'Fosforlu Gübreler', 'Potasyumlu Gübreler']
        }
    },
    'makine': {
        'Traktörler': {
            'Güç Sınıfları': ['Küçük Traktörler (25-50 HP)', 'Orta Traktörler (50-100 HP)', 'Büyük Traktörler (100+ HP)']
        },
        'Ekim Makineleri': {
            'Ekim Türleri': ['Tohum Ekim Makineleri', 'Fide Dikim Makineleri', 'Gübre Dağıtıcıları']
        },
        'Hasat Makineleri': {
            'Hasat Türleri': ['Biçerdöverler', 'Patates Hasat Makineleri', 'Pamuk Toplama Makineleri']
        },
        'Sulama Sistemleri': {
            'Sulama Türleri': ['Damla Sulama', 'Yağmurlama Sulama', 'Sprinkler Sistemleri']
        }
    },
    'ekipman': {
        'Hayvan Barınakları': {
            'Barınak Türleri': ['Ahırlar', 'Kümesler', 'Ağıllar']
        },
        'Yem Depoları': {
            'Depo Türleri': ['Silaj Çukurları', 'Yem Silosu', 'Samandağı']
        },
        'Su Sistemleri': {
            'Su Ekipmanları': ['Su Tankları', 'Su Pompaları', 'Su Boruları']
        }
    }
};

export const cityCoordinates: { [key: string]: { latitude: number, longitude: number } } = {
    'İstanbul': { latitude: 41.0082, longitude: 28.9784 },
    'Ankara': { latitude: 39.9334, longitude: 32.8597 },
    'İzmir': { latitude: 38.4192, longitude: 27.1287 },
    'Antalya': { latitude: 36.8969, longitude: 30.7133 },
    'Bursa': { latitude: 40.1826, longitude: 29.0665 },
    'Adana': { latitude: 37.0000, longitude: 35.3213 },
    'Konya': { latitude: 37.8746, longitude: 32.4932 },
    'Gaziantep': { latitude: 37.0662, longitude: 37.3833 },
    'Kayseri': { latitude: 38.7312, longitude: 35.4787 },
    'Trabzon': { latitude: 41.0015, longitude: 39.7178 },
};
