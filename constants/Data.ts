
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

export const cityDistricts: { [key: string]: string[] } = {
    'Adana': ['Aladağ', 'Ceyhan', 'Çukurova', 'Feke', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Sarıçam', 'Seyhan', 'Tufanbeyli', 'Yumurtalık', 'Yüreğir'],
    'Adıyaman': ['Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Merkez', 'Samsat', 'Sincik', 'Tut'],
    'Afyonkarahisar': ['Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Merkez', 'Sandıklı', 'Sinanpaşa', 'Sultandağı', 'Şuhut'],
    'Ağrı': ['Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Merkez', 'Patnos', 'Taşlıçay', 'Tutak'],
    'Amasya': ['Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merkez', 'Merzifon', 'Suluova', 'Taşova'],
    'Ankara': ['Akyurt', 'Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı', 'Güdül', 'Haymana', 'Kalecik', 'Kahramankazan', 'Keçiören', 'Kızılcahamam', 'Mamak', 'Nallıhan', 'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar', 'Yenimahalle'],
    'Antalya': ['Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Kepez', 'Konyaaltı', 'Korkuteli', 'Kumluca', 'Manavgat', 'Muratpaşa', 'Serik'],
    'Artvin': ['Ardanuç', 'Arhavi', 'Borçka', 'Hopa', 'Kemalpaşa', 'Merkez', 'Murgul', 'Şavşat', 'Yusufeli'],
    'Aydın': ['Bozdoğan', 'Buharkent', 'Çine', 'Didim', 'Efeler', 'Germencik', 'İncirliova', 'Karacasu', 'Karpuzlu', 'Koçarlı', 'Köşk', 'Kuşadası', 'Kuyucak', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar'],
    'Balıkesir': ['Altıeylül', 'Ayvalık', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gömeç', 'Gönen', 'Havran', 'İvrindi', 'Karesi', 'Kepsut', 'Manyas', 'Marmara', 'Savaştepe', 'Sındırgı', 'Susurluk'],
    'Bilecik': ['Bozüyük', 'Gölpazarı', 'İnhisar', 'Merkez', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar'],
    'Bingöl': ['Adaklı', 'Genç', 'Karlıova', 'Kiğı', 'Merkez', 'Solhan', 'Yayladere', 'Yedisu'],
    'Bitlis': ['Adilcevaz', 'Ahlat', 'Güroymak', 'Hizan', 'Merkez', 'Mutki', 'Tatvan'],
    'Bolu': ['Dörtdivan', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Merkez', 'Mudurnu', 'Seben', 'Yeniçağa'],
    'Burdur': ['Ağlasun', 'Altınyayla', 'Bucak', 'Çavdır', 'Çeltikçi', 'Gölhisar', 'Karamanlı', 'Kemer', 'Merkez', 'Tefenni', 'Yeşilova'],
    'Bursa': ['Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl', 'İznik', 'Karacabey', 'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa', 'Nilüfer', 'Orhaneli', 'Orhangazi', 'Osmangazi', 'Yenişehir', 'Yıldırım'],
    'Çanakkale': ['Ayvacık', 'Bayramiç', 'Biga', 'Bozcaada', 'Çan', 'Eceabat', 'Ezine', 'Gelibolu', 'Gökçeada', 'Lapseki', 'Merkez', 'Yenice'],
    'Çankırı': ['Atkaracalar', 'Bayramören', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Kızılırmak', 'Korgun', 'Kurşunlu', 'Merkez', 'Orta', 'Şabanözü', 'Yapraklı'],
    'Çorum': ['Alaca', 'Bayat', 'Boğazkale', 'Dodurga', 'İskilip', 'Kargı', 'Laçin', 'Mecitözü', 'Merkez', 'Oğuzlar', 'Ortaköy', 'Osmancık', 'Sungurlu', 'Uğurludağ'],
    'Denizli': ['Acıpayam', 'Babadağ', 'Baklan', 'Bekilli', 'Beyağaç', 'Bozkurt', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Güney', 'Honaz', 'Kale', 'Merkezefendi', 'Pamukkale', 'Sarayköy', 'Serinhisar', 'Tavas'],
    'Diyarbakır': ['Bağlar', 'Bismil', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Eğil', 'Ergani', 'Hani', 'Hazro', 'Kayapınar', 'Kocaköy', 'Kulp', 'Lice', 'Silvan', 'Sur', 'Yenişehir'],
    'Edirne': ['Enez', 'Havsa', 'İpsala', 'Keşan', 'Lalapaşa', 'Meriç', 'Merkez', 'Süloğlu', 'Uzunköprü'],
    'Elazığ': ['Ağın', 'Alacakaya', 'Arıcak', 'Baskil', 'Karakoçan', 'Keban', 'Kovancılar', 'Maden', 'Merkez', 'Palu', 'Sivrice'],
    'Erzincan': ['Çayırlı', 'İliç', 'Kemah', 'Kemaliye', 'Merkez', 'Otlukbeli', 'Refahiye', 'Tercan', 'Üzümlü'],
    'Erzurum': ['Aşkale', 'Aziziye', 'Çat', 'Hınıs', 'Horasan', 'İspir', 'Karaçoban', 'Karayazı', 'Köprüköy', 'Narman', 'Oltu', 'Olur', 'Palandöken', 'Pasinler', 'Pazaryolu', 'Şenkaya', 'Tekman', 'Tortum', 'Uzundere', 'Yakutiye'],
    'Eskişehir': ['Alpu', 'Beylikova', 'Çifteler', 'Günyüzü', 'Han', 'İnönü', 'Mahmudiye', 'Mihalgazi', 'Mihalıççık', 'Odunpazarı', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar', 'Tepebaşı'],
    'Gaziantep': ['Araban', 'İslahiye', 'Karkamış', 'Nizip', 'Nurdağı', 'Oğuzeli', 'Şahinbey', 'Şehitkamil', 'Yavuzeli'],
    'Giresun': ['Alucra', 'Bulancak', 'Çamoluk', 'Çanakçı', 'Dereli', 'Doğankent', 'Espiye', 'Eynesil', 'Görele', 'Güce', 'Keşap', 'Merkez', 'Piraziz', 'Şebinkarahisar', 'Tirebolu', 'Yağlıdere'],
    'Gümüşhane': ['Kelkit', 'Köse', 'Kürtün', 'Merkez', 'Şiran', 'Torul'],
    'Hakkari': ['Çukurca', 'Derecik', 'Merkez', 'Şemdinli', 'Yüksekova'],
    'Hatay': ['Altınözü', 'Antakya', 'Arsuz', 'Belen', 'Defne', 'Dörtyol', 'Erzin', 'Hassa', 'İskenderun', 'Kırıkhan', 'Kumlu', 'Payas', 'Reyhanlı', 'Samandağ', 'Yayladağı'],
    'Isparta': ['Aksu', 'Atabey', 'Eğirdir', 'Gelendost', 'Gönen', 'Keçiborlu', 'Merkez', 'Senirkent', 'Sütçüler', 'Şarkikaraağaç', 'Uluborlu', 'Yalvaç', 'Yenişarbademli'],
    'Mersin': ['Akdeniz', 'Anamur', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Erdemli', 'Gülnar', 'Mezitli', 'Mut', 'Silifke', 'Tarsus', 'Toroslar', 'Yenişehir'],
    'İstanbul': ['Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü', 'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'],
    'İzmir': ['Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova', 'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'],
    'Kars': ['Akyaka', 'Arpaçay', 'Digor', 'Kağızman', 'Merkez', 'Sarıkamış', 'Selim', 'Susuz'],
    'Kastamonu': ['Abana', 'Ağlı', 'Araç', 'Azdavay', 'Bozkurt', 'Cide', 'Çatalzeytin', 'Daday', 'Devrekani', 'Doğanyurt', 'Hanönü', 'İhsangazi', 'İnebolu', 'Küre', 'Merkez', 'Pınarbaşı', 'Seydiler', 'Şenpazar', 'Taşköprü', 'Tosya'],
    'Kayseri': ['Akkışla', 'Bünyan', 'Develi', 'Felahiye', 'Hacılar', 'İncesu', 'Kocasinan', 'Melikgazi', 'Özvatan', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Talas', 'Tomarza', 'Yahyalı', 'Yeşilhisar'],
    'Kırklareli': ['Babaeski', 'Demirköy', 'Kofçaz', 'Lüleburgaz', 'Merkez', 'Pehlivanköy', 'Pınarhisar', 'Vize'],
    'Kırşehir': ['Akçakent', 'Akpınar', 'Boztepe', 'Çiçekdağı', 'Kaman', 'Merkez', 'Mucur'],
    'Kocaeli': ['Başiskele', 'Çayırova', 'Darıca', 'Derince', 'Dilovası', 'Gebze', 'Gölcük', 'İzmit', 'Kandıra', 'Karamürsel', 'Kartepe', 'Körfez'],
    'Konya': ['Ahırlı', 'Akören', 'Akşehir', 'Altınekin', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çeltik', 'Çumra', 'Derbent', 'Derebucak', 'Doğanhisar', 'Emirgazi', 'Ereğli', 'Güneysınır', 'Hadim', 'Halkapınar', 'Hüyük', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Karatay', 'Kulu', 'Meram', 'Sarayönü', 'Selçuklu', 'Seydişehir', 'Taşkent', 'Tuzlukçu', 'Yalıhüyük', 'Yunak'],
    'Kütahya': ['Altıntaş', 'Aslanapa', 'Çavdarhisar', 'Domaniç', 'Dumlupınar', 'Emet', 'Gediz', 'Hisarcık', 'Merkez', 'Pazarlar', 'Simav', 'Şaphane', 'Tavşanlı'],
    'Malatya': ['Akçadağ', 'Arapgir', 'Arguvan', 'Battalgazi', 'Darende', 'Doğanşehir', 'Doğanyol', 'Hekimhan', 'Kale', 'Kuluncak', 'Pütürge', 'Yazıhan', 'Yeşilyurt'],
    'Manisa': ['Ahmetli', 'Akhisar', 'Alaşehir', 'Demirci', 'Gölmarmara', 'Gördes', 'Kırkağaç', 'Köprübaşı', 'Kula', 'Salihli', 'Sarıgöl', 'Saruhanlı', 'Selendi', 'Soma', 'Şehzadeler', 'Turgutlu', 'Yunusemre'],
    'Kahramanmaraş': ['Afşin', 'Andırın', 'Çağlayancerit', 'Dulkadiroğlu', 'Ekinözü', 'Elbistan', 'Göksun', 'Nurhak', 'Onikişubat', 'Pazarcık', 'Türkoğlu'],
    'Mardin': ['Artuklu', 'Dargeçit', 'Derik', 'Kızıltepe', 'Mazıdağı', 'Midyat', 'Nusaybin', 'Ömerli', 'Savur', 'Yeşilli'],
    'Muğla': ['Bodrum', 'Dalaman', 'Datça', 'Fethiye', 'Kavaklıdere', 'Köyceğiz', 'Marmaris', 'Menteşe', 'Milas', 'Ortaca', 'Seydikemer', 'Ula', 'Yatağan'],
    'Muş': ['Bulanık', 'Hasköy', 'Korkut', 'Malazgirt', 'Merkez', 'Varto'],
    'Nevşehir': ['Acıgöl', 'Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Merkez', 'Ürgüp'],
    'Niğde': ['Altunhisar', 'Bor', 'Çamardı', 'Çiftlik', 'Merkez', 'Ulukışla'],
    'Ordu': ['Akkuş', 'Altınordu', 'Aybastı', 'Çamaş', 'Çatalpınar', 'Çaybaşı', 'Fatsa', 'Gölköy', 'Gülyalı', 'Gürgentepe', 'İkizce', 'Kabadüz', 'Kabataş', 'Korgan', 'Kumru', 'Mesudiye', 'Perşembe', 'Ulubey', 'Ünye'],
    'Rize': ['Ardeşen', 'Çamlıhemşin', 'Çayeli', 'Derepazarı', 'Fındıklı', 'Güneysu', 'Hemşin', 'İkizdere', 'İyidere', 'Kalkandere', 'Merkez', 'Pazar'],
    'Sakarya': ['Adapazarı', 'Akyazı', 'Arifiye', 'Erenler', 'Ferizli', 'Geyve', 'Hendek', 'Karapürçek', 'Karasu', 'Kaynarca', 'Kocaali', 'Pamukova', 'Sapanca', 'Serdivan', 'Söğütlü', 'Taraklı'],
    'Samsun': ['19 Mayıs', 'Alaçam', 'Asarcık', 'Atakum', 'Ayvacık', 'Bafra', 'Canik', 'Çarşamba', 'Havza', 'İlkadım', 'Kavak', 'Ladik', 'Salıpazarı', 'Tekkeköy', 'Terme', 'Vezirköprü', 'Yakakent'],
    'Siirt': ['Baykan', 'Eruh', 'Kurtalan', 'Merkez', 'Pervari', 'Şirvan', 'Tillo'],
    'Sinop': ['Ayancık', 'Boyabat', 'Dikmen', 'Durağan', 'Erfelek', 'Gerze', 'Merkez', 'Saraydüzü', 'Türkeli'],
    'Sivas': ['Akıncılar', 'Altınyayla', 'Divriği', 'Doğanşar', 'Gemerek', 'Gölova', 'Gürün', 'Hafik', 'İmranlı', 'Kangal', 'Koyulhisar', 'Merkez', 'Suşehri', 'Şarkışla', 'Ulaş', 'Yıldızeli', 'Zara'],
    'Tekirdağ': ['Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Kapaklı', 'Malkara', 'Marmaraereğlisi', 'Muratlı', 'Saray', 'Süleymanpaşa', 'Şarköy'],
    'Tokat': ['Almus', 'Artova', 'Başçiftlik', 'Erbaa', 'Merkez', 'Niksar', 'Pazar', 'Reşadiye', 'Sulusaray', 'Turhal', 'Yeşilyurt', 'Zile'],
    'Trabzon': ['Akçaabat', 'Araklı', 'Arsin', 'Beşikdüzü', 'Çarşıbaşı', 'Çaykara', 'Dernekpazarı', 'Düzköy', 'Hayrat', 'Köprübaşı', 'Maçka', 'Of', 'Ortahisar', 'Sürmene', 'Şalpazarı', 'Tonya', 'Vakfıkebir', 'Yomra'],
    'Tunceli': ['Çemişgezek', 'Hozat', 'Mazgirt', 'Merkez', 'Nazımiye', 'Ovacık', 'Pertek', 'Pülümür'],
    'Şanlıurfa': ['Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Eyyübiye', 'Halfeti', 'Haliliye', 'Harran', 'Hilvan', 'Karaköprü', 'Siverek', 'Suruç', 'Viranşehir'],
    'Uşak': ['Banaz', 'Eşme', 'Karahallı', 'Merkez', 'Sivaslı', 'Ulubey'],
    'Van': ['Bahçesaray', 'Başkale', 'Çaldıran', 'Çatak', 'Edremit', 'Erciş', 'Gevaş', 'Gürpınar', 'İpekyolu', 'Muradiye', 'Özalp', 'Saray', 'Tuşba'],
    'Yozgat': ['Akdağmadeni', 'Aydıncık', 'Boğazlıyan', 'Çandır', 'Çayıralan', 'Çekerek', 'Kadışehri', 'Merkez', 'Saraykent', 'Sarıkaya', 'Sorgun', 'Şefaatli', 'Yenifakılı', 'Yerköy'],
    'Zonguldak': ['Alaplı', 'Çaycuma', 'Devrek', 'Ereğli', 'Gökçebey', 'Kilimli', 'Kozlu', 'Merkez'],
    'Aksaray': ['Ağaçören', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Merkez', 'Ortaköy', 'Sarıyahşi', 'Sultanhanı'],
    'Bayburt': ['Aydıntepe', 'Demirözü', 'Merkez'],
    'Karaman': ['Ayrancı', 'Başyayla', 'Ermenek', 'Kazımkarabekir', 'Merkez', 'Sarıveliler'],
    'Kırıkkale': ['Bahşılı', 'Balışeyh', 'Çelebi', 'Delice', 'Karakeçili', 'Keskin', 'Merkez', 'Sulakyurt', 'Yahşihan'],
    'Batman': ['Beşiri', 'Gercüş', 'Hasankeyf', 'Kozluk', 'Merkez', 'Sason'],
    'Şırnak': ['Beytüşşebap', 'Cizre', 'Güçlükonak', 'İdil', 'Merkez', 'Silopi', 'Uludere'],
    'Bartın': ['Amasra', 'Kurucaşile', 'Merkez', 'Ulus'],
    'Ardahan': ['Çıldır', 'Damal', 'Göle', 'Hanak', 'Merkez', 'Posof'],
    'Iğdır': ['Aralık', 'Karakoyunlu', 'Merkez', 'Tuzluca'],
    'Yalova': ['Altınova', 'Armutlu', 'Çınarcık', 'Çiftlikköy', 'Merkez', 'Termal'],
    'Karabük': ['Eflani', 'Eskipazar', 'Merkez', 'Ovacık', 'Safranbolu', 'Yenice'],
    'Kilis': ['Elbeyli', 'Merkez', 'Musabeyli', 'Polateli'],
    'Osmaniye': ['Bahçe', 'Düziçi', 'Hasanbeyli', 'Kadirli', 'Merkez', 'Sumbas', 'Toprakkale'],
    'Düzce': ['Akçakoca', 'Cumayeri', 'Çilimli', 'Gölyaka', 'Gümüşova', 'Kaynaşlı', 'Merkez', 'Yığılca']
};
