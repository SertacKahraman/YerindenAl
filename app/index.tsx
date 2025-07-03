import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { arrayRemove, arrayUnion, collection, doc as firestoreDoc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import ProductCard from '../components/ProductCard';
import { db } from '../config/firebase';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';

export default function HomeScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';
    const { selectedLocation, setSelectedLocation } = useLocation();
    const { addToCart } = useCart();
    const { user, signOut } = useAuth();
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

    // Türkiye'deki iller
    const cities = [
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

    // Kategoriler
    const categories = [
        'Tüm Kategoriler',
        'Süt Ürünleri',
        'Yumurta',
        'Sebze',
        'Meyve',
        'Et Ürünleri',
        'Bal',
        'Zeytin',
        'Peynir',
        'Diğer'
    ];

    // Popüler aramalar
    const popularSearches = [
        'Taze Süt',
        'Organik Yumurta',
        'Köy Peyniri',
        'Bal',
        'Zeytin'
    ];

    // Firestore'dan ürünleri çek
    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, 'products'));
            const items: any[] = [];
            querySnapshot.forEach((doc: any) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setProducts(items);
            setLoading(false);
        }
        fetchProducts();
    }, []);

    // Kullanıcı favorilerini çek
    useEffect(() => {
        async function fetchFavorites() {
            if (!user) {
                setFavoriteIds([]);
                return;
            }
            const userRef = firestoreDoc(db, 'users', user.id);
            const userSnap = await getDoc(userRef);
            const favs = userSnap.exists() && userSnap.data().favorites ? userSnap.data().favorites : [];
            setFavoriteIds(favs);
        }
        fetchFavorites();
    }, [user]);

    // Arama geçmişini kaydet
    const saveSearchHistory = (query: string) => {
        if (query.trim()) {
            setSearchHistory(prev => {
                const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5);
                return newHistory;
            });
        }
    };

    // Arama geçmişini temizle
    const clearSearchHistory = () => {
        setSearchHistory([]);
    };

    // Filtrelenmiş ürünler
    const getFilteredProducts = () => {
        return products.filter(product => {
            const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || selectedCategory === 'Tüm Kategoriler' ||
                product.category === selectedCategory;
            const matchesPrice = parseFloat(product.price) >= priceRange.min && parseFloat(product.price) <= priceRange.max;
            const matchesLocation = !selectedLocation || selectedLocation === 'Tüm Türkiye' ||
                product.location === selectedLocation;
            return matchesSearch && matchesCategory && matchesPrice && matchesLocation;
        });
    };

    // Arama sayfasına yönlendir
    const handleSearchPress = () => {
        router.push('/search');
    };

    const handleProductPress = (id: string) => {
        router.push({
            pathname: '/product/[id]',
            params: { id }
        });
    };

    const handleLocationSelect = (city: string) => {
        setSelectedLocation(city);
        setShowLocationModal(false);
    };

    // Favori ekle/çıkar fonksiyonu
    const handleToggleFavorite = async (productId: string) => {
        if (!user) {
            alert('Favorilere eklemek için giriş yapmalısınız.');
            return;
        }
        const userRef = firestoreDoc(db, 'users', user.id);
        try {
            if (favoriteIds.includes(productId)) {
                await updateDoc(userRef, { favorites: arrayRemove(productId) });
                setFavoriteIds(favoriteIds.filter(id => id !== productId));
            } else {
                await updateDoc(userRef, { favorites: arrayUnion(productId) });
                setFavoriteIds([...favoriteIds, productId]);
            }
        } catch (e) {
            alert('Favori işlemi sırasında bir hata oluştu.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.content, isWeb && { maxWidth: 1200, width: '100%', marginHorizontal: 'auto' }]}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Pressable
                            style={styles.searchButton}
                            onPress={handleSearchPress}
                        >
                            <Ionicons name="search" size={20} color={Colors.primary} />
                            <Text style={styles.searchText}>
                                {searchQuery || 'İlan ara...'}
                            </Text>
                        </Pressable>
                        <Pressable
                            style={styles.profileButton}
                            onPress={() => {
                                if (user) {
                                    router.push('/profile');
                                } else {
                                    router.push('/auth');
                                }
                            }}
                        >
                            <Ionicons name="person-outline" size={24} color={Colors.text} />
                        </Pressable>
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>YerindenAl</Text>
                        <Pressable
                            style={styles.locationSelector}
                            onPress={() => setShowLocationModal(true)}
                        >
                            <Ionicons name="location-outline" size={20} color={Colors.primary} />
                            <Text style={styles.locationText}>
                                {selectedLocation === 'Tüm Türkiye' ? 'Konum seçin' : selectedLocation}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={Colors.primary} />
                        </Pressable>
                    </View>
                    <Text style={styles.subtitle}>
                        {selectedLocation === 'Tüm Türkiye' ? 'Tüm Türkiye\'deki ilanlar' : `${selectedLocation} ilindeki ilanlar`}
                    </Text>
                </View>

                <ScrollView style={styles.productList}>
                    <View style={styles.productsGrid}>
                        {loading ? (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                                <ActivityIndicator size="large" color={Colors.primary} />
                            </View>
                        ) : getFilteredProducts().map((product) => (
                            <ProductCard
                                key={product.id}
                                title={product.title}
                                price={parseFloat(product.price)}
                                image={product.image}
                                location={product.location}
                                onPress={() => handleProductPress(product.id)}
                                isFavorite={favoriteIds.includes(product.id)}
                                onToggleFavorite={() => handleToggleFavorite(product.id)}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>

            <Modal
                visible={showLocationModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowLocationModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Konum Seçin</Text>
                            <Pressable onPress={() => setShowLocationModal(false)}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </Pressable>
                        </View>
                        <ScrollView style={styles.cityList}>
                            {cities.map((city) => (
                                <Pressable
                                    key={city}
                                    style={[
                                        styles.cityItem,
                                        selectedLocation === city && styles.selectedCityItem
                                    ]}
                                    onPress={() => handleLocationSelect(city)}
                                >
                                    <Text style={[
                                        styles.cityText,
                                        selectedLocation === city && styles.selectedCityText
                                    ]}>
                                        {city}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <BottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flex: 1,
        marginRight: 12,
    },
    profileButton: {
        padding: 4,
    },
    searchText: {
        marginLeft: 8,
        fontSize: 16,
        color: Colors.textSecondary,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    locationSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    locationText: {
        fontSize: 16,
        color: Colors.primary,
        marginHorizontal: 8,
    },
    productList: {
        paddingBottom: 16,
    },
    productsGrid: {
        padding: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productCard: {
        width: '48%',
        backgroundColor: Colors.white,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    productImage: {
        height: 120,
        backgroundColor: Colors.background,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    productInfo: {
        padding: 12,
    },
    productTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productLocation: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
    },
    cityList: {
        maxHeight: '80%',
    },
    cityItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    selectedCityItem: {
        backgroundColor: Colors.primary + '20',
    },
    cityText: {
        fontSize: 16,
        color: Colors.text,
    },
    selectedCityText: {
        color: Colors.primary,
        fontWeight: '600',
    },
}); 