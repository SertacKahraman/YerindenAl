import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { arrayRemove, arrayUnion, collection, doc as firestoreDoc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import ProductCard from '../../components/ProductCard';
import WebFooter from '../../components/web/WebFooter';
import WebLayout from '../../components/web/WebLayout';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';

export default function HomeScreenWeb() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const { selectedLocation, setSelectedLocation } = useLocation();
    const { user } = useAuth();

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Grid Configuration
    const numColumns = width > 1200 ? 5 : width > 900 ? 4 : width > 600 ? 3 : 2;

    // Categories
    const categories = [
        { id: 'all', name: 'Tüm Kategoriler', icon: 'grid' },
        { id: 'Süt Ürünleri', name: 'Süt Ürünleri', icon: 'water' },
        { id: 'Yumurta', name: 'Yumurta', icon: 'egg' },
        { id: 'Sebze', name: 'Sebze', icon: 'leaf' },
        { id: 'Meyve', name: 'Meyve', icon: 'nutrition' },
        { id: 'Et Ürünleri', name: 'Et Ürünleri', icon: 'restaurant' },
        { id: 'Bal', name: 'Bal', icon: 'flask' },
        { id: 'Zeytin', name: 'Zeytin', icon: 'ellipse' },
        { id: 'Peynir', name: 'Peynir', icon: 'pizza' },
    ];

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

    const getFilteredProducts = () => {
        return products.filter(product => {
            const matchesCategory = !selectedCategory || selectedCategory === 'all' || product.category === selectedCategory;
            return matchesCategory;
        });
    };

    return (
        <WebLayout showFooter={false}>
            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>

                {/* Trust/Info Bar */}
                <View style={styles.trustBarWrapper}>
                    <View style={styles.trustBar}>
                        <View style={styles.trustItem}>
                            <View style={styles.trustIconBg}>
                                <Ionicons name="leaf-outline" size={24} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.trustTitle}>%100 Doğal</Text>
                                <Text style={styles.trustDesc}>Yerel üreticiden</Text>
                            </View>
                        </View>
                        <View style={styles.trustItem}>
                            <View style={styles.trustIconBg}>
                                <Ionicons name="time-outline" size={24} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.trustTitle}>Taze Teslimat</Text>
                                <Text style={styles.trustDesc}>Hızlı ve güvenli</Text>
                            </View>
                        </View>
                        <View style={styles.trustItem}>
                            <View style={styles.trustIconBg}>
                                <Ionicons name="shield-checkmark-outline" size={24} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.trustTitle}>Güvenli Ödeme</Text>
                                <Text style={styles.trustDesc}>Korumalı alışveriş</Text>
                            </View>
                        </View>
                        <View style={styles.trustItem}>
                            <View style={styles.trustIconBg}>
                                <Ionicons name="headset-outline" size={24} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.trustTitle}>7/24 Destek</Text>
                                <Text style={styles.trustDesc}>Her zaman yanınızda</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Promo Banners */}
                <View style={styles.promoSection}>
                    <View style={styles.promoGrid}>
                        <Pressable style={[styles.promoCard, { backgroundColor: '#E3F2FD' }]}>
                            <View style={styles.promoContent}>
                                <Text style={[styles.promoTag, { color: '#1565C0', backgroundColor: '#BBDEFB' }]}>YENİ SEZON</Text>
                                <Text style={styles.promoTitle}>Taze Meyve & Sebze</Text>
                                <Text style={[styles.promoLink, { color: '#1565C0' }]}>İncele &rarr;</Text>
                            </View>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2670&auto=format&fit=crop' }}
                                style={styles.promoImage}
                            />
                        </Pressable>
                        <Pressable style={[styles.promoCard, { backgroundColor: '#F1F8E9' }]}>
                            <View style={styles.promoContent}>
                                <Text style={[styles.promoTag, { color: '#2E7D32', backgroundColor: '#C8E6C9' }]}>ORGANİK</Text>
                                <Text style={styles.promoTitle}>Günlük Süt & Yumurta</Text>
                                <Text style={[styles.promoLink, { color: '#2E7D32' }]}>İncele &rarr;</Text>
                            </View>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=2680&auto=format&fit=crop' }}
                                style={styles.promoImage}
                            />
                        </Pressable>
                        <Pressable style={[styles.promoCard, { backgroundColor: '#FFF3E0' }]}>
                            <View style={styles.promoContent}>
                                <Text style={[styles.promoTag, { color: '#EF6C00', backgroundColor: '#FFE0B2' }]}>ÖZEL</Text>
                                <Text style={styles.promoTitle}>Yöresel Lezzetler</Text>
                                <Text style={[styles.promoLink, { color: '#EF6C00' }]}>İncele &rarr;</Text>
                            </View>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop' }}
                                style={styles.promoImage}
                            />
                        </Pressable>
                    </View>
                </View>

                {/* Categories Bar */}
                <View style={styles.categoriesWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
                        {categories.map((cat) => (
                            <Pressable
                                key={cat.id}
                                style={[
                                    styles.categoryItem,
                                    selectedCategory === cat.id && styles.categoryItemActive
                                ]}
                                onPress={() => setSelectedCategory(cat.id === 'all' ? null : cat.id)}
                            >
                                <Ionicons
                                    name={cat.icon as any}
                                    size={20}
                                    color={selectedCategory === cat.id ? Colors.white : Colors.textSecondary}
                                />
                                <Text style={[
                                    styles.categoryText,
                                    selectedCategory === cat.id && styles.categoryTextActive
                                ]}>{cat.name}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Products Section */}
                <View style={styles.productsWrapper}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            {selectedCategory && selectedCategory !== 'all' ? selectedCategory : 'Öne Çıkan Ürünler'}
                        </Text>
                        <Pressable onPress={() => { }}>
                            <Text style={styles.seeAllText}>Tümünü Gör</Text>
                        </Pressable>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <View style={styles.productsGrid}>
                            {getFilteredProducts().map((item) => (
                                <View key={item.id} style={{ width: `${100 / numColumns}%`, padding: 8 }}>
                                    <ProductCard
                                        title={item.title}
                                        price={parseFloat(item.price)}
                                        image={item.image}
                                        location={item.location}
                                        onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
                                        isFavorite={favoriteIds.includes(item.id)}
                                        onToggleFavorite={() => handleToggleFavorite(item.id)}
                                        style={{ width: '100%', margin: 0 }}
                                    />
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <WebFooter />
            </ScrollView>
        </WebLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    trustBarWrapper: {
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingVertical: 24,
    },
    trustBar: {
        maxWidth: 1200,
        width: '100%',
        marginHorizontal: 'auto',
        paddingHorizontal: 24,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 24,
    },
    trustItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minWidth: 200,
    },
    trustIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trustTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    trustDesc: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    promoSection: {
        maxWidth: 1200,
        width: '100%',
        marginHorizontal: 'auto',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    promoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    promoCard: {
        flex: 1,
        minWidth: 300,
        height: 200,
        borderRadius: 16,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
    },
    promoContent: {
        flex: 1,
        gap: 12,
        zIndex: 1,
    },
    promoTag: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        overflow: 'hidden',
    },
    promoTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
    },
    promoLink: {
        fontSize: 14,
        fontWeight: '600',
    },
    promoImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
        transform: [{ rotate: '15deg' }, { translateX: 20 }],
    },
    categoriesWrapper: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.white,
    },
    categoriesContent: {
        maxWidth: 1200,
        marginHorizontal: 'auto',
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 12,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 8,
        marginRight: 8,
    },
    categoryItemActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    categoryTextActive: {
        color: Colors.white,
    },
    productsWrapper: {
        maxWidth: 1200,
        width: '100%',
        marginHorizontal: 'auto',
        paddingHorizontal: 24,
        paddingVertical: 40,
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
    },
    seeAllText: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: '600',
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    loadingContainer: {
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
