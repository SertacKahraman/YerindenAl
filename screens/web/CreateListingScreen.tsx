import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import WebFooter from '../../components/web/WebFooter';
import WebLayout from '../../components/web/WebLayout';
import { db, storage } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

// Categories data (same as mobile)
const mainCategories = [
    { id: 'hayvancilik', name: 'Hayvancılık', icon: '🐄' },
    { id: 'tarim', name: 'Tarım Ürünleri', icon: '🌱' },
    { id: 'hayvansal', name: 'Hayvansal Ürünler', icon: '🥛' },
    { id: 'dogal', name: 'Doğal Ürünler', icon: '🍯' },
    { id: 'yem', name: 'Yem ve Gübre', icon: '🌿' },
    { id: 'makine', name: 'Tarım Makineleri', icon: '🚜' },
    { id: 'ekipman', name: 'Çiftlik Ekipmanları', icon: '🏠' }
];

const detailedCategories: any = {
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

export default function CreateListingScreenWeb() {
    // ... (State and hooks remain the same)
    const router = useRouter();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
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
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    // Dynamic fields
    const [gender, setGender] = useState<string>('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [organicCertified, setOrganicCertified] = useState(false);
    const [harvestDate, setHarvestDate] = useState('');
    const [storageCondition, setStorageCondition] = useState('');
    const [bulkAvailable, setBulkAvailable] = useState(false);

    // ... (Handlers remain the same)
    const handleMainCategorySelect = (categoryId: string) => {
        setSelectedMainCategory(categoryId);
        if (!detailedCategories[categoryId]) {
            setCurrentStep(5);
        } else {
            setCurrentStep(2);
        }
    };

    const handleSubCategorySelect = (subCategory: string) => {
        setSelectedSubCategory(subCategory);
        setCurrentStep(3);
    };

    const handleTypeSelect = (type: string) => {
        setSelectedType(type);
        setCurrentStep(4);
    };

    const handleBreedSelect = (breed: string) => {
        setSelectedBreed(breed);
        setCurrentStep(5);
    };

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsMultipleSelection: true,
            quality: 0.7,
        });

        if (!result.canceled && result.assets) {
            const newImages = result.assets.map(asset => asset.uri);
            setImages([...images, ...newImages].slice(0, 5));
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim() || !price || !locationCity) {
            alert('Lütfen zorunlu alanları doldurun.');
            return;
        }

        setUploading(true);
        try {
            const uploadedUrls = [];
            for (const imageUri of images) {
                const response = await fetch(imageUri);
                const blob = await response.blob();
                const filename = `products/${user?.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
                const storageRef = ref(storage, filename);
                await uploadBytes(storageRef, blob);
                const downloadURL = await getDownloadURL(storageRef);
                uploadedUrls.push(downloadURL);
            }

            const productData: any = {
                title,
                description,
                price,
                unit,
                location: locationCity,
                images: uploadedUrls,
                image: uploadedUrls[0] || '',
                category: selectedBreed || selectedType || selectedSubCategory || selectedMainCategory,
                mainCategory: selectedMainCategory,
                subCategory: selectedSubCategory,
                type: selectedType,
                breed: selectedBreed,
                seller: {
                    id: user?.id,
                    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email,
                    photoURL: user?.photoURL
                },
                createdAt: Timestamp.now(),
                gender,
                age,
                weight,
                organicCertified,
                harvestDate,
                storageCondition,
                bulkAvailable
            };

            await addDoc(collection(db, 'products'), productData);
            alert('İlanınız başarıyla yayınlandı!');
            router.replace('/');
        } catch (error) {
            console.error(error);
            alert('Bir hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    if (!user) {
        return (
            <WebLayout>
                <View style={styles.centerContainer}>
                    <Text style={styles.messageText}>İlan vermek için giriş yapmalısınız.</Text>
                </View>
            </WebLayout>
        );
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <View>
                        <Text style={styles.stepTitle}>Kategori Seçin</Text>
                        <View style={styles.grid}>
                            {mainCategories.map((item) => (
                                <Pressable key={item.id} style={styles.categoryCard} onPress={() => handleMainCategorySelect(item.id)}>
                                    <Text style={styles.categoryIcon}>{item.icon}</Text>
                                    <Text style={styles.categoryName}>{item.name}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                );
            case 2:
                const subCats = detailedCategories[selectedMainCategory!] ? Object.keys(detailedCategories[selectedMainCategory!]) : [];
                return (
                    <View>
                        <Text style={styles.stepTitle}>Alt Kategori Seçin</Text>
                        <View style={styles.list}>
                            {subCats.map((item) => (
                                <Pressable key={item} style={styles.listItem} onPress={() => handleSubCategorySelect(item)}>
                                    <Text style={styles.listItemText}>{item}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                                </Pressable>
                            ))}
                        </View>
                    </View>
                );
            case 3:
                const types = Object.keys(detailedCategories[selectedMainCategory!][selectedSubCategory!]);
                return (
                    <View>
                        <Text style={styles.stepTitle}>Tür Seçin</Text>
                        <View style={styles.list}>
                            {types.map((item) => (
                                <Pressable key={item} style={styles.listItem} onPress={() => handleTypeSelect(item)}>
                                    <Text style={styles.listItemText}>{item}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                                </Pressable>
                            ))}
                        </View>
                    </View>
                );
            case 4:
                const breeds = detailedCategories[selectedMainCategory!][selectedSubCategory!][selectedType!];
                return (
                    <View>
                        <Text style={styles.stepTitle}>Cins Seçin</Text>
                        <View style={styles.list}>
                            {breeds.map((item: string) => (
                                <Pressable key={item} style={styles.listItem} onPress={() => handleBreedSelect(item)}>
                                    <Text style={styles.listItemText}>{item}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                                </Pressable>
                            ))}
                        </View>
                    </View>
                );
            case 5:
                const isAnimal = selectedMainCategory === 'hayvancilik';
                const isPlantOrFood = selectedMainCategory === 'tarim' || selectedMainCategory === 'hayvansal' || selectedMainCategory === 'dogal';

                return (
                    <View style={styles.form}>
                        <Text style={styles.stepTitle}>İlan Detayları</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Başlık</Text>
                            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="İlan başlığı" />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Açıklama</Text>
                            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Detaylı açıklama" multiline numberOfLines={4} />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Fiyat</Text>
                                <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="numeric" />
                            </View>
                            <View style={[styles.inputGroup, { width: 120 }]}>
                                <Text style={styles.label}>Birim</Text>
                                <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder="Adet" />
                            </View>
                        </View>

                        {isAnimal && (
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Cinsiyet</Text>
                                    <View style={styles.genderSelector}>
                                        {['Erkek', 'Dişi'].map((g) => (
                                            <Pressable
                                                key={g}
                                                style={[styles.genderButton, gender === g && styles.genderButtonActive]}
                                                onPress={() => setGender(g)}
                                            >
                                                <Text style={[styles.genderButtonText, gender === g && styles.genderButtonTextActive]}>{g}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Yaş</Text>
                                    <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="Yaş" keyboardType="numeric" />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Ağırlık</Text>
                                    <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder="Kg" keyboardType="numeric" />
                                </View>
                            </View>
                        )}

                        {isPlantOrFood && (
                            <>
                                <View style={styles.inputGroup}>
                                    <Pressable style={styles.checkboxRow} onPress={() => setOrganicCertified(!organicCertified)}>
                                        <View style={[styles.checkbox, organicCertified && styles.checkboxActive]}>
                                            {organicCertified && <Ionicons name="checkmark" size={16} color={Colors.white} />}
                                        </View>
                                        <Text style={styles.checkboxLabel}>Organik Sertifikalı</Text>
                                    </Pressable>
                                </View>
                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>Hasat Tarihi</Text>
                                        <TextInput style={styles.input} value={harvestDate} onChangeText={setHarvestDate} placeholder="Örn: Ekim 2023" />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>Saklama Koşulları</Text>
                                        <TextInput style={styles.input} value={storageCondition} onChangeText={setStorageCondition} placeholder="Örn: Serin yer" />
                                    </View>
                                </View>
                            </>
                        )}

                        <View style={styles.inputGroup}>
                            <Pressable style={styles.checkboxRow} onPress={() => setBulkAvailable(!bulkAvailable)}>
                                <View style={[styles.checkbox, bulkAvailable && styles.checkboxActive]}>
                                    {bulkAvailable && <Ionicons name="checkmark" size={16} color={Colors.white} />}
                                </View>
                                <Text style={styles.checkboxLabel}>Toplu Satış Var</Text>
                            </Pressable>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Konum (Şehir)</Text>
                            <TextInput style={styles.input} value={locationCity} onChangeText={setLocationCity} placeholder="Şehir" />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Fotoğraflar</Text>
                            <View style={styles.imageGrid}>
                                {images.map((uri, index) => (
                                    <View key={index} style={styles.imageWrapper}>
                                        <Image source={{ uri }} style={styles.image} />
                                        <Pressable style={styles.removeImage} onPress={() => removeImage(index)}>
                                            <Ionicons name="close" size={16} color={Colors.white} />
                                        </Pressable>
                                    </View>
                                ))}
                                {images.length < 5 && (
                                    <Pressable style={styles.addImage} onPress={pickImages}>
                                        <Ionicons name="add" size={32} color={Colors.textSecondary} />
                                    </Pressable>
                                )}
                            </View>
                        </View>

                        <Pressable
                            style={[styles.submitButton, uploading && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={uploading}
                        >
                            {uploading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitButtonText}>İlanı Yayınla</Text>}
                        </Pressable>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <WebLayout showFooter={false}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.container}>
                    <View style={styles.card}>
                        {currentStep > 1 && (
                            <Pressable style={styles.backButton} onPress={() => setCurrentStep(currentStep - 1)}>
                                <Ionicons name="arrow-back" size={24} color={Colors.text} />
                                <Text style={styles.backText}>Geri</Text>
                            </Pressable>
                        )}
                        {renderStepContent()}
                    </View>
                </View>
                <WebFooter />
            </ScrollView>
        </WebLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 40,
    },
    centerContainer: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageText: {
        fontSize: 18,
        color: Colors.textSecondary,
    },
    card: {
        width: '100%',
        maxWidth: 800,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 24,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
    },
    categoryCard: {
        width: 140,
        height: 140,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        cursor: 'pointer',
    },
    categoryIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'center',
    },
    list: {
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    listItemText: {
        fontSize: 16,
        color: Colors.text,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },
    textArea: {
        height: 120,
        paddingTop: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: Colors.border,
    },
    removeImage: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: Colors.error,
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.border,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButton: {
        height: 50,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 4,
    },
    backText: {
        fontSize: 16,
        color: Colors.text,
    },
    genderSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    genderButton: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
    },
    genderButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    genderButtonText: {
        color: Colors.text,
        fontWeight: '500',
    },
    genderButtonTextActive: {
        color: Colors.white,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    checkboxLabel: {
        fontSize: 16,
        color: Colors.text,
    },
});
