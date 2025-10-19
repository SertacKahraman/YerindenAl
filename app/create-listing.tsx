import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedBreed, setSelectedBreed] = useState<string | null>(null);

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
        setCurrentStep(5);
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
            <Text style={styles.stepTitle}>Kategori Seçin</Text>
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
                <Text style={styles.stepTitle}>Alt Kategori Seçin</Text>
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
                <Text style={styles.stepTitle}>Tür Seçin</Text>
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
                <Text style={styles.stepTitle}>Cins/Çeşit Seçin</Text>
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
                return (
                    <View style={styles.content}>
                        <Text style={styles.stepTitle}>Kategori Seçildi</Text>
                        <Text style={styles.stepSubtitle}>
                            {mainCategories.find(cat => cat.id === selectedMainCategory)?.name} - {selectedSubCategory} - {selectedType} - {selectedBreed}
                        </Text>
                        <Text style={styles.successText}>
                            Kategori seçimi tamamlandı! Şimdi ürün bilgilerini girebilirsiniz.
                        </Text>
                    </View>
                );
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
                     'Kategori Seçildi'}
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
    stepTitle: {
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
});
