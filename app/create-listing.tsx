import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import LocationPicker from '../components/LocationPicker';

import { SafeAreaView } from 'react-native-safe-area-context';
import { db, storage } from '../config/firebase';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

// Ana kategoriler
const mainCategories = [
    { id: 'hayvancilik', name: 'Hayvancılık', icon: '🐄' },
    { id: 'tarim', name: 'Tarım Ürünleri', icon: '🌱' },
    { id: 'hayvansal', name: 'Hayvansal Ürünler', icon: '🥛' },
    { id: 'dogal', name: 'Doğal Ürünler', icon: '🍯' },
    { id: 'yem', name: 'Yem ve Gübre', icon: '🌿' },
    { id: 'makine', name: 'Tarım Makineleri', icon: '🚜' },
    { id: 'ekipman', name: 'Çiftlik Ekipmanları', icon: '🏠' }
];

// Detaylı kategori yapısı
const detailedCategories = {
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

export default function CreateListingScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1); // 1-4: category, 5: form, 6: location
    const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedBreed, setSelectedBreed] = useState<string | null>(null);

    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('Adet');
    const [locationCity, setLocationCity] = useState('');
    const [locationCoords, setLocationCoords] = useState<{ latitude: number, longitude: number } | null>(null);
    const [locationAddress, setLocationAddress] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Dynamic fields based on category
    const [gender, setGender] = useState<string>(''); // For animals
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [organicCertified, setOrganicCertified] = useState<boolean>(false); // For plants/food
    const [harvestDate, setHarvestDate] = useState('');
    const [storageCondition, setStorageCondition] = useState('');
    const [bulkAvailable, setBulkAvailable] = useState<boolean>(false); // Bulk purchase

    const handleMainCategorySelect = (categoryId: string) => {
        setSelectedMainCategory(categoryId);
        setSelectedSubCategory(null);
        setSelectedType(null);
        setSelectedBreed(null);
        setCurrentStep(2);
    };

    const handleSubCategorySelect = (subCategory: string) => {
        setSelectedSubCategory(subCategory);
        setSelectedType(null);
        setSelectedBreed(null);
        setCurrentStep(3);
    };

    const handleTypeSelect = (type: string) => {
        setSelectedType(type);
        setSelectedBreed(null);
        setCurrentStep(4);
    };

    const handleBreedSelect = (breed: string) => {
        setSelectedBreed(breed);
        setCurrentStep(5); // Go to form step
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Location permission denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setCurrentLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    const handleUseCurrentLocation = async () => {
        setLoadingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('İzin Gerekli', 'Konumunuzu almak için konum iznine ihtiyacımız var.');
                setLoadingLocation(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const coords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            };
            setLocationCoords(coords);

            // Reverse geocoding to get address
            const addressResponse = await Location.reverseGeocodeAsync(coords);
            if (addressResponse.length > 0) {
                const addr = addressResponse[0];

                // İl (province/region) bilgisini al - ilçe değil!
                // addr.region genellikle il ismini içerir
                // addr.subregion genellikle ilçe ismini içerir
                let province = (addr.region || '').trim();
                let district = (addr.subregion || addr.city || '').trim();

                // Normalize province name to match our city list
                if (province.toLowerCase() === 'içel') province = 'Mersin';
                if (province.toLowerCase() === 'istanbul') province = 'İstanbul';
                if (province.toLowerCase() === 'izmir') province = 'İzmir';

                // Set city as the province (il)
                setLocationCity(province);

                // Build full address with district and province
                const fullAddress = `${addr.street || ''}, ${district}, ${province}`.replace(/^, |, $/g, '');
                setLocationAddress(fullAddress);

                console.log('GPS Location:', {
                    province: province,
                    district: district,
                    fullAddress: fullAddress,
                    rawData: addr
                });
            }
        } catch (error) {
            console.error('Error getting current location:', error);
            Alert.alert('Hata', 'Konumunuz alınamadı.');
        } finally {
            setLoadingLocation(false);
        }
    };

    const handleMapPress = async (event: any) => {
        const coords = event.nativeEvent.coordinate;
        setLocationCoords(coords);

        try {
            const addressResponse = await Location.reverseGeocodeAsync(coords);
            if (addressResponse.length > 0) {
                const addr = addressResponse[0];

                // İl (province) bilgisini al - ilçe değil
                let province = (addr.region || '').trim();
                let district = (addr.subregion || addr.city || '').trim();

                // Normalize province name
                if (province.toLowerCase() === 'içel') province = 'Mersin';
                if (province.toLowerCase() === 'istanbul') province = 'İstanbul';
                if (province.toLowerCase() === 'izmir') province = 'İzmir';

                setLocationCity(province);

                const fullAddress = `${addr.street || ''}, ${district}, ${province}`.replace(/^, |, $/g, '');
                setLocationAddress(fullAddress);
            }
        } catch (error) {
            console.error('Error reverse geocoding:', error);
        }
    };

    const handleCitySelect = (city: string) => {
        // Trim whitespace to ensure exact matching
        setLocationCity(city.trim());
        // Get approximate coordinates for the city (you can expand this with a city->coords mapping)
        const cityCoords = getCityCoordinates(city);
        if (cityCoords) {
            setLocationCoords(cityCoords);
            setLocationAddress(city.trim());
        }
    };

    const getCityCoordinates = (city: string): { latitude: number, longitude: number } | null => {
        // Türkiye'deki şehirlerin koordinatları
        const cityMap: { [key: string]: { latitude: number, longitude: number } } = {
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
        return cityMap[city] || { latitude: 39.9334, longitude: 32.8597 }; // Varsayılan: Ankara
    };

    const getCityList = () => {
        return [
            'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
            'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
            'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane',
            'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli',
            'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş',
            'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
            'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
            'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
        ];
    };

    const pickImages = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('İzin Gerekli', 'Fotoğraf eklemek için galeri erişim izni vermelisiniz.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsMultipleSelection: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets) {
            const newImages = result.assets.map(asset => asset.uri);
            setImages([...images, ...newImages].slice(0, 5)); // Max 5 images
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const uploadImages = async () => {
        const uploadedUrls: string[] = [];

        for (const imageUri of images) {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const filename = `products/${user?.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const storageRef = ref(storage, filename);
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);
            uploadedUrls.push(downloadURL);
        }

        return uploadedUrls;
    };

    const handleSubmit = async () => {
        // Validation
        if (!title.trim()) {
            Alert.alert('Hata', 'Lütfen ilan başlığı girin.');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Hata', 'Lütfen ürün açıklaması girin.');
            return;
        }
        if (!price || parseFloat(price) <= 0) {
            Alert.alert('Hata', 'Lütfen geçerli bir fiyat girin.');
            return;
        }
        if (!locationCity) {
            Alert.alert('Hata', 'Lütfen konum seçin.');
            return;
        }

        setUploading(true);

        try {
            // Upload images (if any)
            let imageUrls: string[] = [];
            if (images.length > 0) {
                imageUrls = await uploadImages();
            }

            // Prepare product data
            const productData: any = {
                title,
                description,
                price,
                unit,
                location: locationCity,
                locationAddress: locationAddress || locationCity,
                locationCoords: locationCoords,
                images: imageUrls,
                image: imageUrls.length > 0 ? imageUrls[0] : '', // First image as main, or empty string
                category: selectedBreed || selectedType || selectedSubCategory || selectedMainCategory,
                mainCategory: selectedMainCategory,
                subCategory: selectedSubCategory,
                type: selectedType,
                breed: selectedBreed,
                seller: {
                    id: user?.id,
                    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    email: user?.email,
                    photoURL: user?.photoURL
                },
                createdAt: Timestamp.now(),
            };

            // Add category-specific fields
            if (selectedMainCategory === 'hayvancilik') {
                if (gender) productData.gender = gender;
                if (age) productData.age = age;
                if (weight) productData.weight = weight;
            }

            if (selectedMainCategory === 'tarim' || selectedMainCategory === 'hayvansal' || selectedMainCategory === 'dogal') {
                productData.organicCertified = organicCertified;
                if (harvestDate) productData.harvestDate = harvestDate;
                if (storageCondition) productData.storageCondition = storageCondition;
            }

            // Add bulk purchase availability
            productData.bulkAvailable = bulkAvailable;

            // Add to Firestore
            await addDoc(collection(db, 'products'), productData);

            Alert.alert('Başarılı', 'İlanınız yayınlandı!', [
                { text: 'Tamam', onPress: () => router.replace('/') }
            ]);
        } catch (error) {
            console.error('Error creating listing:', error);
            Alert.alert('Hata', 'İlan oluşturulurken bir hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            if (currentStep === 2) {
                setSelectedMainCategory(null);
            } else if (currentStep === 3) {
                setSelectedSubCategory(null);
            } else if (currentStep === 4) {
                setSelectedType(null);
            } else if (currentStep === 5) {
                setSelectedBreed(null);
            }
        }
    };

    // Kullanıcı giriş yapmamışsa uyarı ver
    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </Pressable>
                    <Text style={styles.headerTitle}>İlan Ver</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.authRequiredContainer}>
                    <Ionicons name="lock-closed" size={64} color={Colors.textSecondary} />
                    <Text style={styles.authRequiredTitle}>Giriş Gerekli</Text>
                    <Text style={styles.authRequiredText}>
                        İlan vermek için önce giriş yapmanız gerekiyor.
                    </Text>
                    <Pressable
                        style={styles.loginButton}
                        onPress={() => router.push('/auth')}
                    >
                        <Text style={styles.loginButtonText}>Giriş Yap</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }


    const renderMainCategories = () => (
        <View style={styles.content}>
            <Text style={styles.categoryStepTitle}>Kategori Seçin</Text>
            <Text style={styles.stepSubtitle}>İlanınızın ana kategorisini seçin</Text>

            <FlatList
                data={mainCategories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.categoryButton}
                        onPress={() => handleMainCategorySelect(item.id)}
                    >
                        <Text style={styles.categoryIcon}>{item.icon}</Text>
                        <Text style={styles.categoryText}>{item.name}</Text>
                        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                    </Pressable>
                )}
                style={styles.categoryList}
            />
        </View>
    );

    const renderSubCategories = () => {
        if (!selectedMainCategory) return null;

        const subCats = Object.keys(detailedCategories[selectedMainCategory as keyof typeof detailedCategories]);

        return (
            <View style={styles.content}>
                <Text style={styles.categoryStepTitle}>Alt Kategori Seçin</Text>
                <Text style={styles.stepSubtitle}>
                    {mainCategories.find(cat => cat.id === selectedMainCategory)?.name} - Alt kategori seçin
                </Text>

                <FlatList
                    data={subCats}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <Pressable
                            style={styles.categoryButton}
                            onPress={() => handleSubCategorySelect(item)}
                        >
                            <Text style={styles.categoryText}>{item}</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                        </Pressable>
                    )}
                    style={styles.categoryList}
                />
            </View>
        );
    };

    const renderTypes = () => {
        if (!selectedMainCategory || !selectedSubCategory) return null;

        const types = Object.keys((detailedCategories as any)[selectedMainCategory][selectedSubCategory]);

        return (
            <View style={styles.content}>
                <Text style={styles.categoryStepTitle}>Tür Seçin</Text>
                <Text style={styles.stepSubtitle}>
                    {selectedSubCategory} - Tür seçin
                </Text>

                <FlatList
                    data={types}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <Pressable
                            style={styles.categoryButton}
                            onPress={() => handleTypeSelect(item)}
                        >
                            <Text style={styles.categoryText}>{item}</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                        </Pressable>
                    )}
                    style={styles.categoryList}
                />
            </View>
        );
    };

    const renderBreeds = () => {
        if (!selectedMainCategory || !selectedSubCategory || !selectedType) return null;

        const breeds = (detailedCategories as any)[selectedMainCategory][selectedSubCategory][selectedType];

        return (
            <View style={styles.content}>
                <Text style={styles.categoryStepTitle}>Cins/Çeşit Seçin</Text>
                <Text style={styles.stepSubtitle}>
                    {selectedType} - Cins/çeşit seçin
                </Text>

                <FlatList
                    data={breeds}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <Pressable
                            style={styles.categoryButton}
                            onPress={() => handleBreedSelect(item)}
                        >
                            <Text style={styles.categoryText}>{item}</Text>
                            <Ionicons name="checkmark" size={20} color={Colors.primary} />
                        </Pressable>
                    )}
                    style={styles.categoryList}
                />
            </View>
        );
    };

    const renderProductForm = () => {
        const isAnimal = selectedMainCategory === 'hayvancilik';
        const isPlantOrFood = selectedMainCategory === 'tarim' || selectedMainCategory === 'hayvansal' || selectedMainCategory === 'dogal';

        return (
            <KeyboardAvoidingView
                style={styles.formContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.formHeader}>
                        <Ionicons name="create-outline" size={32} color={Colors.primary} />
                        <Text style={styles.formTitle}>İlan Bilgilerini Girin</Text>
                        <Text style={styles.formSubtitle}>
                            {mainCategories.find(cat => cat.id === selectedMainCategory)?.name}
                            {selectedBreed && ` - ${selectedBreed}`}
                        </Text>
                    </View>

                    {/* Step 1: Basic Info */}
                    <View style={styles.formStep}>
                        <View style={styles.stepHeader}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <Text style={styles.stepTitle}>Temel Bilgiler</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                <Ionicons name="pricetag-outline" size={16} color={Colors.primary} /> İlan Başlığı *
                            </Text>
                            <TextInput
                                style={styles.simpleInput}
                                placeholder="Örn: Taze Organik Domates"
                                placeholderTextColor={Colors.textSecondary}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                <Ionicons name="document-text-outline" size={16} color={Colors.primary} /> Açıklama *
                            </Text>
                            <TextInput
                                style={[styles.simpleInput, styles.textArea]}
                                placeholder="Ürün hakkında detaylı bilgi verin..."
                                placeholderTextColor={Colors.textSecondary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </View>

                    {/* Step 2: Price & Unit */}
                    <View style={styles.formStep}>
                        <View style={styles.stepHeader}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <Text style={styles.stepTitle}>Fiyat ve Birim</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                <Ionicons name="cash-outline" size={16} color={Colors.primary} /> Fiyat *
                            </Text>
                            <TextInput
                                style={[styles.simpleInput, styles.priceInput]}
                                placeholder="0.00"
                                placeholderTextColor={Colors.textSecondary}
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                <Ionicons name="cube-outline" size={16} color={Colors.primary} /> Birim Seçin *
                            </Text>
                            <View style={styles.unitGrid}>
                                {[
                                    { value: 'Adet', icon: 'cube-outline' },
                                    { value: 'Kg', icon: 'scale-outline' },
                                    { value: 'Litre', icon: 'water-outline' },
                                    { value: 'Koli', icon: 'apps-outline' }
                                ].map((item) => (
                                    <Pressable
                                        key={item.value}
                                        style={[styles.unitOption, unit === item.value && styles.unitOptionActive]}
                                        onPress={() => setUnit(item.value)}
                                    >
                                        <Ionicons
                                            name={item.icon as any}
                                            size={24}
                                            color={unit === item.value ? Colors.white : Colors.primary}
                                        />
                                        <Text style={[styles.unitOptionText, unit === item.value && styles.unitOptionTextActive]}>
                                            {item.value}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Step 3: Category-Specific Fields */}
                    {(isAnimal || isPlantOrFood) && (
                        <View style={styles.formStep}>
                            <View style={styles.stepHeader}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>3</Text>
                                </View>
                                <Text style={styles.stepTitle}>Özellikler</Text>
                            </View>

                            {isAnimal && (
                                <>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>
                                            <Ionicons name="male-female-outline" size={16} color={Colors.primary} /> Cinsiyet
                                        </Text>
                                        <View style={styles.genderSelector}>
                                            {['Erkek', 'Dişi'].map((g) => (
                                                <Pressable
                                                    key={g}
                                                    style={[styles.genderButton, gender === g && styles.genderButtonActive]}
                                                    onPress={() => setGender(g)}
                                                >
                                                    <Ionicons
                                                        name={g === 'Erkek' ? 'male' : 'female'}
                                                        size={20}
                                                        color={gender === g ? Colors.white : Colors.primary}
                                                    />
                                                    <Text style={[styles.genderButtonText, gender === g && styles.genderButtonTextActive]}>{g}</Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>

                                    <View style={styles.twoColumns}>
                                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                            <Text style={styles.inputLabel}>Yaş (Yıl)</Text>
                                            <TextInput
                                                style={styles.simpleInput}
                                                placeholder="0"
                                                placeholderTextColor={Colors.textSecondary}
                                                value={age}
                                                onChangeText={(text) => {
                                                    // Only allow numbers
                                                    const numericValue = text.replace(/[^0-9]/g, '');
                                                    setAge(numericValue);
                                                }}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                            <Text style={styles.inputLabel}>Ağırlık (kg)</Text>
                                            <TextInput
                                                style={styles.simpleInput}
                                                placeholder="0"
                                                placeholderTextColor={Colors.textSecondary}
                                                value={weight}
                                                onChangeText={setWeight}
                                                keyboardType="decimal-pad"
                                            />
                                        </View>
                                    </View>
                                </>
                            )}

                            {isPlantOrFood && (
                                <>
                                    <Pressable
                                        style={styles.checkboxRow}
                                        onPress={() => setOrganicCertified(!organicCertified)}
                                    >
                                        <View style={[styles.checkboxNew, organicCertified && styles.checkboxNewActive]}>
                                            {organicCertified && <Ionicons name="checkmark" size={20} color={Colors.white} />}
                                        </View>
                                        <View style={styles.checkboxContent}>
                                            <Text style={styles.checkboxTitle}>Organik Sertifikalı</Text>
                                            <Text style={styles.checkboxDescription}>Ürününüz organik sertifikasına sahipse işaretleyin</Text>
                                        </View>
                                    </Pressable>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Hasat/Üretim Tarihi</Text>
                                        <TextInput
                                            style={styles.simpleInput}
                                            placeholder="Örn: Ekim 2025"
                                            placeholderTextColor={Colors.textSecondary}
                                            value={harvestDate}
                                            onChangeText={setHarvestDate}
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Saklama Koşulları</Text>
                                        <TextInput
                                            style={styles.simpleInput}
                                            placeholder="Örn: Serin ve kuru ortamda"
                                            placeholderTextColor={Colors.textSecondary}
                                            value={storageCondition}
                                            onChangeText={setStorageCondition}
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                    )}

                    {/* Step 4: Bulk Purchase */}
                    <View style={styles.formStep}>
                        <View style={styles.stepHeader}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>{isAnimal || isPlantOrFood ? '4' : '3'}</Text>
                            </View>
                            <Text style={styles.stepTitle}>Toplu Satış</Text>
                        </View>
                        <Text style={styles.stepDescription}>Toplu satış yapmayı düşünüyor musunuz?</Text>
                        <View style={styles.yesNoSelector}>
                            <Pressable
                                style={[styles.yesNoButton, bulkAvailable && styles.yesNoButtonActive]}
                                onPress={() => setBulkAvailable(true)}
                            >
                                <Ionicons
                                    name="checkmark-circle"
                                    size={28}
                                    color={bulkAvailable ? Colors.white : Colors.primary}
                                />
                                <Text style={[styles.yesNoButtonText, bulkAvailable && styles.yesNoButtonTextActive]}>
                                    Evet
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[styles.yesNoButton, !bulkAvailable && styles.yesNoButtonActive]}
                                onPress={() => setBulkAvailable(false)}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={28}
                                    color={!bulkAvailable ? Colors.white : Colors.textSecondary}
                                />
                                <Text style={[styles.yesNoButtonText, !bulkAvailable && styles.yesNoButtonTextActive]}>
                                    Hayır
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Step 5: Photos */}
                    <View style={styles.formStep}>
                        <View style={styles.stepHeader}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>{isAnimal || isPlantOrFood ? '5' : '4'}</Text>
                            </View>
                            <Text style={styles.stepTitle}>Fotoğraflar Ekleyin</Text>
                        </View>
                        <Text style={styles.stepDescription}>Fotoğraf ekleyerek ürününüzü daha iyi tanıtabilirsiniz (Opsiyonel)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
                            {images.map((uri, index) => (
                                <View key={index} style={styles.imagePreview}>
                                    <Image source={{ uri }} style={styles.previewImage} />
                                    <Pressable style={styles.removeImageButton} onPress={() => removeImage(index)}>
                                        <Ionicons name="close" size={16} color={Colors.white} />
                                    </Pressable>
                                </View>
                            ))}
                            {images.length < 5 && (
                                <Pressable style={styles.addImageButton} onPress={pickImages}>
                                    <Ionicons name="camera" size={40} color={Colors.primary} />
                                    <Text style={styles.addImageText}>Fotoğraf{"\n"}Ekle</Text>
                                </Pressable>
                            )}
                        </ScrollView>
                    </View>

                    {/* Continue Button */}
                    <Pressable
                        style={styles.continueButtonNew}
                        onPress={() => {
                            // Validate all required fields
                            if (!title.trim()) {
                                Alert.alert('Eksik Bilgi', 'Lütfen ilan başlığı girin.');
                                return;
                            }
                            if (!description.trim()) {
                                Alert.alert('Eksik Bilgi', 'Lütfen ürün açıklaması girin.');
                                return;
                            }
                            if (!price || parseFloat(price) <= 0) {
                                Alert.alert('Eksik Bilgi', 'Lütfen geçerli bir fiyat girin.');
                                return;
                            }
                            if (!unit) {
                                Alert.alert('Eksik Bilgi', 'Lütfen birim seçin.');
                                return;
                            }

                            // Category-specific validations
                            const isAnimal = selectedMainCategory === 'hayvancilik';
                            const isPlantOrFood = selectedMainCategory === 'tarim' || selectedMainCategory === 'hayvansal' || selectedMainCategory === 'dogal';

                            if (isAnimal) {
                                if (!gender) {
                                    Alert.alert('Eksik Bilgi', 'Lütfen cinsiyet seçin.');
                                    return;
                                }
                                if (!age.trim() || parseInt(age) <= 0) {
                                    Alert.alert('Eksik Bilgi', 'Lütfen geçerli bir yaş girin (sadece sayı).');
                                    return;
                                }
                                if (!weight || parseFloat(weight) <= 0) {
                                    Alert.alert('Eksik Bilgi', 'Lütfen geçerli bir ağırlık girin.');
                                    return;
                                }
                            }

                            // All validations passed
                            setCurrentStep(6);
                        }}
                    >
                        <Text style={styles.continueButtonNewText}>Sonraki: Konum Seçimi</Text>
                        <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                    </Pressable>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        );
    };

    const renderLocationSelection = () => {
        return (
            <View style={styles.locationContainer}>
                <View style={styles.locationHeader}>
                    <Text style={styles.locationTitle}>Konum Seçin</Text>
                    <Text style={styles.locationSubtitle}>Şehir seçin</Text>
                </View>

                {/* Current Location Button */}
                <Pressable
                    style={styles.currentLocationButton}
                    onPress={handleUseCurrentLocation}
                    disabled={loadingLocation}
                >
                    <Ionicons name="locate" size={20} color={Colors.white} />
                    <Text style={styles.currentLocationText}>
                        {loadingLocation ? 'Konum Alınıyor...' : 'Mevcut Konumumu Kullan'}
                    </Text>
                </Pressable>

                {/* Map View */}
                <LocationPicker
                    locationCoords={locationCoords}
                    onMapPress={handleMapPress}
                />



                {/* Selected Location Info */}
                {locationCity && (
                    <View style={styles.selectedLocationInfo}>
                        <Ionicons name="location" size={20} color={Colors.primary} />
                        <View style={styles.selectedLocationText}>
                            <Text style={styles.selectedCity}>{locationCity}</Text>
                            {locationAddress && <Text style={styles.selectedAddress}>{locationAddress}</Text>}
                        </View>
                    </View>
                )}

                {/* Publish Button */}
                <Pressable
                    style={[styles.publishButton, (!locationCity || uploading) && styles.publishButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!locationCity || uploading}
                >
                    {uploading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
                            <Text style={styles.publishButtonText}>İlanı Yayınla</Text>
                        </>
                    )}
                </Pressable>
            </View>
        );
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderMainCategories();
            case 2:
                return renderSubCategories();
            case 3:
                return renderTypes();
            case 4:
                return renderBreeds();
            case 5:
                return renderProductForm();
            case 6:
                return renderLocationSelection();
            default:
                return renderMainCategories();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={currentStep === 1 ? () => router.back() : handleBack}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>
                    {currentStep === 1 ? 'İlan Ver' :
                        currentStep === 2 ? 'Alt Kategori' :
                            currentStep === 3 ? 'Tür Seçimi' :
                                currentStep === 4 ? 'Cins/Çeşit' :
                                    currentStep === 5 ? 'İlan Bilgileri' :
                                        'Konum Seçimi'}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {renderCurrentStep()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    categoryStepTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 24,
    },
    categoryList: {
        flex: 1,
    },
    categoryButton: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    categoryText: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
        flex: 1,
    },
    successText: {
        fontSize: 16,
        color: Colors.primary,
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 24,
    },
    formContainer: {
        flex: 1,
    },
    formScroll: {
        flex: 1,
        paddingHorizontal: 16,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    categoryPath: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 24,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: Colors.text,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    unitSelectorNew: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    unitCard: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    unitCardActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    unitCardText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    unitCardTextActive: {
        color: Colors.white,
    },
    bulkSelector: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    bulkOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
    },
    bulkOptionActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    bulkOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    bulkOptionTextActive: {
        color: Colors.white,
    },
    helperText: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 8,
        fontStyle: 'italic',
    },
    locationGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingBottom: 8,
    },
    cityButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
        marginRight: 8,
        marginBottom: 8,
    },
    cityButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    cityButtonText: {
        fontSize: 14,
        color: Colors.text,
    },
    cityButtonTextActive: {
        color: Colors.white,
        fontWeight: '500',
    },
    genderSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    genderButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
    },
    genderButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    genderButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
    },
    genderButtonTextActive: {
        color: Colors.white,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    checkboxLabel: {
        fontSize: 16,
        color: Colors.text,
    },
    imageScrollView: {
        marginTop: 8,
    },
    imagePreview: {
        width: 120,
        height: 120,
        marginRight: 12,
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        backgroundColor: Colors.border,
    },
    removeImageButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        padding: 2,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addImageButton: {
        width: 120,
        height: 120,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
    },
    addImageText: {
        fontSize: 12,
        color: Colors.primary,
        marginTop: 4,
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.white,
    },
    continueButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.white,
    },
    locationContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    locationHeader: {
        marginVertical: 16,
    },
    locationTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    locationSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    currentLocationButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 16,
    },
    currentLocationText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.white,
    },
    quickCitySection: {
        marginBottom: 16,
    },
    quickCityTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
        marginBottom: 8,
    },
    quickCityScroll: {
        marginBottom: 8,
    },
    quickCityButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
        marginRight: 8,
    },
    quickCityButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    quickCityButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
    },
    quickCityButtonTextActive: {
        color: Colors.white,
    },
    mapContainer: {
        height: 300,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 16,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    selectedLocationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    selectedLocationText: {
        flex: 1,
    },
    selectedCity: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    selectedAddress: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    publishButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    publishButtonDisabled: {
        opacity: 0.5,
    },
    publishButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.white,
    },
    allCitiesScroll: {
        maxHeight: 200,
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 12,
    },
    allCitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    cityChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
        marginBottom: 4,
    },
    cityChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    cityChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.text,
    },
    cityChipTextActive: {
        color: Colors.white,
    },
    authRequiredContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    authRequiredTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    authRequiredText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    loginButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.white,
    },
    // New form styles
    formHeader: {
        alignItems: 'center',
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginBottom: 24,
    },
    formSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    formStep: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.white,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    stepDescription: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
        marginBottom: 8,
    },
    simpleInput: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: Colors.text,
    },
    priceInput: {
        textAlign: 'left',
    },
    unitGrid: {
        flexDirection: 'row',
        gap: 10,
    },
    unitOption: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
        gap: 6,
    },
    unitOptionActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    unitOptionText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
    },
    unitOptionTextActive: {
        color: Colors.white,
    },
    twoColumns: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    checkboxNew: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxNewActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    checkboxContent: {
        flex: 1,
    },
    checkboxTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
        marginBottom: 2,
    },
    checkboxDescription: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    yesNoSelector: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    yesNoButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
    },
    yesNoButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    yesNoButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    yesNoButtonTextActive: {
        color: Colors.white,
    },
    continueButtonNew: {
        backgroundColor: Colors.primary,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        shadowColor: Colors.primary,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    continueButtonNewText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.white,
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 6,
        borderRadius: 8,
        alignItems: 'center',
    },
    mapOverlayText: {
        fontSize: 12,
        color: Colors.text,
        fontWeight: '500',
    },
});