import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import ProductCard from '../../components/ProductCard';
import WebFooter from '../../components/web/WebFooter';
import WebLayout from '../../components/web/WebLayout';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useLocation } from '../../context/LocationContext';

export default function SearchResultsScreenWeb() {
    const router = useRouter();
    const { query: urlQuery } = useLocalSearchParams();
    const { width } = useWindowDimensions();
    const { selectedLocation } = useLocation();

    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(urlQuery ? String(urlQuery) : '');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState('newest'); // newest, priceAsc, priceDesc

    const numColumns = width > 1200 ? 4 : width > 900 ? 3 : 2;

    const categories = [
        'Süt Ürünleri', 'Yumurta', 'Sebze', 'Meyve', 'Et Ürünleri', 'Bal', 'Zeytin', 'Peynir'
    ];

    // 1. Fetch all products once (Mobile Strategy)
    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, 'products'));
                const items: any[] = [];
                querySnapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() });
                });
                setProducts(items);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    // 2. Sync URL query to state
    useEffect(() => {
        if (urlQuery !== undefined) {
            setSearchQuery(String(urlQuery));
        }
    }, [urlQuery]);

    // 3. Apply Filters and Sort (Mobile Logic + Category)
    useEffect(() => {
        const applyFiltersAndSort = () => {
            let filtered = products.filter(product => {
                // Search Filter
                const q = searchQuery.toLowerCase();
                const matchesSearch = product.title.toLowerCase().includes(q) ||
                    (product.description && product.description.toLowerCase().includes(q));

                // Location Filter
                const matchesLocation = (selectedLocation && selectedLocation !== 'Tüm Türkiye')
                    ? product.location === selectedLocation
                    : true;

                // Category Filter (Web specific, keeping it)
                const matchesCategory = selectedCategory
                    ? product.category === selectedCategory
                    : true;

                // Price Filter
                const price = parseFloat(product.price);
                const min = parseFloat(minPrice);
                const max = parseFloat(maxPrice);
                const matchesPrice = (isNaN(min) || price >= min) && (isNaN(max) || price <= max);

                return matchesSearch && matchesLocation && matchesCategory && matchesPrice;
            });

            // Sorting
            if (sortOption === 'priceAsc') {
                filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            } else if (sortOption === 'priceDesc') {
                filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            } else if (sortOption === 'newest') {
                // Assuming createdAt is available and comparable (e.g. Firestore Timestamp or ISO string)
                // If strictly following mobile, mobile only has price sort.
                // But web had 'newest'. Let's keep it if possible, or fallback to default.
                // Mobile default is insertion order (or whatever Firestore returned).
                // Firestore returned ordered by nothing specific in mobile code (just collection(db, 'products')).
                // But here we want 'newest' to be meaningful if we have createdAt.
                filtered.sort((a, b) => {
                    const dateA = a.createdAt?.seconds || 0;
                    const dateB = b.createdAt?.seconds || 0;
                    return dateB - dateA;
                });
            }

            setFilteredProducts(filtered);
        };

        if (!loading) {
            applyFiltersAndSort();
        }
    }, [products, searchQuery, selectedLocation, selectedCategory, minPrice, maxPrice, sortOption, loading]);

    return (
        <WebLayout showFooter={false}>
            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.content}>
                    <View style={styles.layout}>
                        {/* Sidebar Filters */}
                        <View style={styles.sidebar}>
                            <View style={styles.filterSection}>
                                <Text style={styles.filterTitle}>Arama</Text>
                                <View style={styles.searchBox}>
                                    <Ionicons name="search" size={20} color={Colors.textSecondary} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Ürün ara..."
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterTitle}>Kategoriler</Text>
                                {categories.map(cat => (
                                    <Pressable
                                        key={cat}
                                        style={[styles.categoryItem, selectedCategory === cat && styles.categoryItemActive]}
                                        onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                    >
                                        <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                                            {cat}
                                        </Text>
                                        {selectedCategory === cat && (
                                            <Ionicons name="checkmark" size={16} color={Colors.primary} />
                                        )}
                                    </Pressable>
                                ))}
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterTitle}>Fiyat Aralığı</Text>
                                <View style={styles.priceInputs}>
                                    <TextInput
                                        style={styles.priceInput}
                                        placeholder="Min"
                                        value={minPrice}
                                        onChangeText={setMinPrice}
                                        keyboardType="numeric"
                                    />
                                    <Text>-</Text>
                                    <TextInput
                                        style={styles.priceInput}
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChangeText={setMaxPrice}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Main Content */}
                        <View style={styles.resultsArea}>
                            <View style={styles.resultsHeader}>
                                <Text style={styles.resultsCount}>{filteredProducts.length} ürün bulundu</Text>
                                <View style={styles.sortWrapper}>
                                    <Text style={styles.sortLabel}>Sırala:</Text>
                                    <View style={styles.sortOptions}>
                                        <Pressable onPress={() => setSortOption('newest')}>
                                            <Text style={[styles.sortOption, sortOption === 'newest' && styles.sortOptionActive]}>Yeni</Text>
                                        </Pressable>
                                        <Pressable onPress={() => setSortOption('priceAsc')}>
                                            <Text style={[styles.sortOption, sortOption === 'priceAsc' && styles.sortOptionActive]}>Artan Fiyat</Text>
                                        </Pressable>
                                        <Pressable onPress={() => setSortOption('priceDesc')}>
                                            <Text style={[styles.sortOption, sortOption === 'priceDesc' && styles.sortOptionActive]}>Azalan Fiyat</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>

                            {loading ? (
                                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
                            ) : (
                                <View style={styles.grid}>
                                    {filteredProducts.map((item) => (
                                        <View key={item.id} style={{ width: `${100 / numColumns}%`, padding: 8 }}>
                                            <ProductCard
                                                title={item.title}
                                                price={parseFloat(item.price)}
                                                image={item.image}
                                                location={item.location}
                                                onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
                                                style={{ width: '100%', margin: 0 }}
                                            />
                                        </View>
                                    ))}
                                </View>
                            )}

                            {!loading && filteredProducts.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
                                    <Text style={styles.emptyText}>Aradığınız kriterlere uygun ürün bulunamadı.</Text>
                                </View>
                            )}
                        </View>
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
    },
    content: {
        maxWidth: 1400,
        width: '100%',
        marginHorizontal: 'auto',
        padding: 24,
        flex: 1,
    },
    layout: {
        flexDirection: 'row',
        gap: 32,
    },
    sidebar: {
        width: 280,
        gap: 24,
    },
    filterSection: {
        backgroundColor: Colors.white,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        paddingHorizontal: 12,
        height: 40,
        borderRadius: 8,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 14,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.background,
    },
    categoryItemActive: {
        backgroundColor: Colors.primary + '10',
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    categoryText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    categoryTextActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    priceInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priceInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: Colors.background,
    },
    resultsArea: {
        flex: 1,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    resultsCount: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    sortWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sortLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    sortOptions: {
        flexDirection: 'row',
        gap: 16,
    },
    sortOption: {
        fontSize: 14,
        color: Colors.textSecondary,
        cursor: 'pointer',
    },
    sortOptionActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 18,
        color: Colors.textSecondary,
    },
});
