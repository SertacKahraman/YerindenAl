import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useProducts } from '../hooks/useProducts';

// Local örnek ürün verileri kaldırıldı

export default function SearchResultsScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';
    const numColumns = isWeb ? (width > 1200 ? 5 : width > 900 ? 4 : width > 600 ? 3 : 2) : 2;
    const { query } = useLocalSearchParams();

    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [searchText, setSearchText] = useState(query?.toString() || '');
    const [sortType, setSortType] = useState<any>(null);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [layout, setLayout] = useState('grid');
    const [isSortDropdownVisible, setSortDropdownVisible] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [activeFilterCount, setActiveFilterCount] = useState(0);
    const { products, loading } = useProducts();

    // Modal içindeki geçici state'ler
    const [tempMinPrice, setTempMinPrice] = useState('');
    const [tempMaxPrice, setTempMaxPrice] = useState('');
    const [tempSelectedLocation, setTempSelectedLocation] = useState<string | null>(null);



    // Konumları dinamik olarak Firestore'dan gelen ürünlerden al
    const uniqueLocations = useMemo(() => {
        const locations = new Set(products.map(p => p.location));
        return ['Tümü', ...Array.from(locations)];
    }, [products]);

    // Filtreleme ve sıralama
    const applyFiltersAndSort = () => {
        const searchQuery = searchText.toLowerCase();
        let filtered = products.filter(product => {
            const matchesSearch = product.title.toLowerCase().includes(searchQuery) ||
                product.description.toLowerCase().includes(searchQuery);
            const matchesLocation = selectedLocation ? product.location === selectedLocation : true;
            const price = parseFloat(product.price);
            const min = parseFloat(minPrice);
            const max = parseFloat(maxPrice);
            const matchesPrice = (isNaN(min) || price >= min) && (isNaN(max) || price <= max);
            return matchesSearch && matchesLocation && matchesPrice;
        });
        if (sortType === 'asc') {
            filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortType === 'desc') {
            filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        }
        setFilteredProducts(filtered);
    };

    useEffect(() => {
        applyFiltersAndSort();
    }, [searchText, sortType, selectedLocation, minPrice, maxPrice, products]);

    const handleSelectLocation = (location: string) => {
        if (location === 'Tümü') {
            setSelectedLocation(null);
        } else {
            setSelectedLocation(location);
        }
        setFilterModalVisible(false);
    };

    const handleOpenFilterModal = () => {
        setTempMinPrice(minPrice);
        setTempMaxPrice(maxPrice);
        setTempSelectedLocation(selectedLocation);
        setFilterModalVisible(true);
    };

    const handleApplyFilters = () => {
        setMinPrice(tempMinPrice);
        setMaxPrice(tempMaxPrice);
        setSelectedLocation(tempSelectedLocation);
        setFilterModalVisible(false);
    };

    const handleClearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setSelectedLocation(null);
        setTempMinPrice('');
        setTempMaxPrice('');
        setTempSelectedLocation(null);
        setFilterModalVisible(false);
    };

    const handleSelectSort = (type: 'asc' | 'desc' | null) => {
        setSortType(type);
        setSortDropdownVisible(false);
    };

    const sortOptions: { key: 'asc' | 'desc' | null, text: string }[] = [
        { key: null, text: 'Varsayılan' },
        { key: 'asc', text: 'Fiyata Göre (Artan)' },
        { key: 'desc', text: 'Fiyata Göre (Azalan)' }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isFilterModalVisible}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setFilterModalVisible(false)} />
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filtrele</Text>
                    </View>
                    <ScrollView style={styles.modalScrollView}>
                        <Text style={styles.modalSectionTitle}>Konum</Text>
                        {uniqueLocations.map(location => (
                            <Pressable
                                key={location}
                                style={styles.modalItem}
                                onPress={() => setTempSelectedLocation(location === 'Tümü' ? null : location)}
                            >
                                <Text style={[styles.modalItemText, (tempSelectedLocation === location || (location === 'Tümü' && tempSelectedLocation === null)) && styles.modalItemTextActive]}>
                                    {location}
                                </Text>
                            </Pressable>
                        ))}

                        <Text style={[styles.modalSectionTitle, { marginTop: 16 }]}>Fiyat Aralığı (TL)</Text>
                        <View style={styles.priceInputContainer}>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="En Az"
                                value={tempMinPrice}
                                onChangeText={setTempMinPrice}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={styles.priceInput}
                                placeholder="En Çok"
                                value={tempMaxPrice}
                                onChangeText={setTempMaxPrice}
                                keyboardType="numeric"
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <Pressable style={styles.clearFilterButton} onPress={handleClearFilters}>
                            <Text style={styles.clearFilterButtonText}>Filtreleri Temizle</Text>
                        </Pressable>
                        <Pressable style={styles.applyFilterButton} onPress={handleApplyFilters}>
                            <Text style={styles.applyFilterButtonText}>Filtreleri Uygula</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <View style={styles.header}>
                <View style={styles.searchRow}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.push('/search')}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </Pressable>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={Colors.primary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="İlan ara..."
                            value={searchText}
                            onChangeText={setSearchText}
                            autoCapitalize="none"
                            autoCorrect={false}
                            spellCheck={false}
                        />
                        {searchText ? (
                            <Pressable onPress={() => setSearchText('')}>
                                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                            </Pressable>
                        ) : null}
                    </View>
                </View>
                <View style={styles.filterRow}>
                    <View>
                        <Pressable
                            style={[styles.filterButton, sortType !== null && styles.filterButtonActive]}
                            onPress={() => setSortDropdownVisible(!isSortDropdownVisible)}
                        >
                            <Text
                                style={[styles.filterButtonText, sortType !== null && styles.filterButtonTextActive]}
                            >
                                {sortOptions.find(opt => opt.key === sortType)?.text || 'Sırala'}
                            </Text>
                            <Ionicons
                                name="chevron-down"
                                size={16}
                                color={sortType !== null ? Colors.white : Colors.primary}
                            />
                        </Pressable>
                        {isSortDropdownVisible && (
                            <View style={styles.sortDropdown}>
                                {sortOptions.map(option => (
                                    <Pressable
                                        key={option.key || 'default'}
                                        style={styles.sortDropdownItem}
                                        onPress={() => handleSelectSort(option.key)}
                                    >
                                        <Text style={styles.sortDropdownItemText}>{option.text}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                        <View style={styles.viewModeContainer}>
                            <Pressable
                                style={[styles.viewModeButton, layout === 'grid' && styles.viewModeButtonActive]}
                                onPress={() => setLayout('grid')}
                            >
                                <Ionicons
                                    name={'apps'}
                                    size={20}
                                    color={layout === 'grid' ? Colors.primary : Colors.textSecondary}
                                />
                            </Pressable>
                            <Pressable
                                style={[styles.viewModeButton, layout === 'list' && styles.viewModeButtonActive]}
                                onPress={() => setLayout('list')}
                            >
                                <Ionicons
                                    name={'list'}
                                    size={20}
                                    color={layout === 'list' ? Colors.primary : Colors.textSecondary}
                                />
                            </Pressable>
                        </View>
                        <View>
                            <Pressable
                                style={[styles.softIconButton, (selectedLocation !== null || minPrice !== '' || maxPrice !== '') && styles.filterButtonActive]}
                                onPress={handleOpenFilterModal}
                            >
                                <Ionicons
                                    name="options"
                                    size={24}
                                    color={(selectedLocation !== null || minPrice !== '' || maxPrice !== '') ? Colors.white : Colors.primary}
                                />
                            </Pressable>
                            {activeFilterCount > 0 && (
                                <View style={styles.filterBadge}>
                                    <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>

            <Text style={styles.resultsCountText}>
                {filteredProducts.length} ürün bulundu
            </Text>

            <ScrollView style={styles.content}>
                {loading ? (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : filteredProducts.length > 0 ? (
                    <View style={layout === 'grid' ? styles.productGrid : styles.productList}>
                        {filteredProducts.map((product) => (
                            <Pressable
                                key={product.id}
                                style={layout === 'grid' ? [styles.productCard, { width: `${100 / numColumns}%` }] : styles.productListCard}
                                onPress={() => router.push(`/product/${product.id}`)}
                            >
                                <Image
                                    source={{ uri: product.image }}
                                    style={layout === 'grid' ? styles.productImage : styles.productListImage}
                                />
                                <View style={layout === 'grid' ? styles.productInfo : styles.productListInfo}>
                                    <Text style={styles.productTitle} numberOfLines={2}>
                                        {product.title}
                                    </Text>
                                    <Text style={styles.productPrice}>
                                        {product.price} TL
                                    </Text>
                                    <View style={styles.productLocation}>
                                        <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                                        <Text style={styles.locationText}>{product.location}</Text>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                ) : (
                    <View style={styles.noResults}>
                        <Ionicons name="search-outline" size={48} color={Colors.textSecondary} />
                        <Text style={styles.noResultsText}>
                            "{searchText}" için sonuç bulunamadı
                        </Text>
                        <Text style={styles.noResultsSubtext}>
                            Farklı anahtar kelimelerle tekrar deneyin
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        zIndex: 10,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: Colors.text,
        padding: 0,
    },
    backButton: {
        padding: 8,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    headerButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.white,
    },
    viewModeContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.border,
        borderRadius: 12,
        padding: 4,
    },
    viewModeButton: {
        padding: 6,
        borderRadius: 8,
    },
    viewModeButtonActive: {
        backgroundColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    softIconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: Colors.primary,
    },
    filterButtonText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: Colors.white,
    },
    content: {
        flex: 1,
    },
    productGrid: {
        padding: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    productCard: {
        width: '50%',
        padding: 8,
    },
    productImage: {
        width: '100%',
        height: 150,
        borderRadius: 12,
        backgroundColor: Colors.border,
    },
    productInfo: {
        padding: 8,
    },
    productList: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    productListCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 8,
    },
    productListImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    productListInfo: {
        flex: 1,
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: 4,
    },
    productLocation: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    noResults: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    noResultsText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginTop: 16,
        textAlign: 'center',
    },
    noResultsSubtext: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 8,
    },
    modalHeader: {
        paddingTop: 8,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalScrollView: {
        maxHeight: 400,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        color: Colors.primary,
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalItemText: {
        fontSize: 16,
        textAlign: 'center',
        color: Colors.text,
    },
    modalItemTextActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    priceInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    priceInput: {
        width: '48%',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
    },
    applyFilterButton: {
        flex: 1,
        marginLeft: 12,
        padding: 12,
        backgroundColor: Colors.primary,
        borderRadius: 8,
    },
    applyFilterButtonText: {
        color: Colors.white,
        textAlign: 'center',
        fontWeight: '600',
    },
    clearFilterButton: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
    },
    clearFilterButtonText: {
        color: Colors.textSecondary,
        textAlign: 'center',
        fontWeight: '500',
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    filterBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#ff3b30',
        borderRadius: 9,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
    sortDropdown: {
        position: 'absolute',
        top: '105%',
        left: 0,
        width: 220,
        backgroundColor: Colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 20,
    },
    sortDropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    sortDropdownItemText: {
        fontSize: 14,
        color: Colors.text,
    },
    resultsCountText: {
        fontSize: 14,
        color: Colors.textSecondary,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
}); 