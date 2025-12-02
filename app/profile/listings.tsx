import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function MyListingsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchListings();
    }, [user]);

    async function fetchListings() {
        if (!user) return;
        setLoading(true);
        try {
            const q = query(collection(db, 'products'), where('seller.id', '==', user.id));
            const snap = await getDocs(q);
            const items: any[] = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            setListings(items);
        } catch (error) {
            console.error('Error fetching listings:', error);
            Alert.alert('Hata', 'İlanlar yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = (id: string) => {
        Alert.alert(
            'İlanı Sil',
            'Bu ilanı silmek istediğinizden emin misiniz?',
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'products', id));
                            setListings(listings.filter(item => item.id !== id));
                            Alert.alert('Başarılı', 'İlan başarıyla silindi.');
                        } catch (error) {
                            console.error('Error deleting listing:', error);
                            Alert.alert('Hata', 'İlan silinirken bir hata oluştu.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>İlanlarım</Text>
            </View>
            <ScrollView style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={Colors.primary} />
                ) : listings.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="list-outline" size={64} color={Colors.textSecondary} />
                        <Text style={styles.emptyText}>Henüz yayınlanmış bir ilanınız yok.</Text>
                        <Pressable style={styles.createButton} onPress={() => router.push('/create-listing')}>
                            <Text style={styles.createButtonText}>İlan Ver</Text>
                        </Pressable>
                    </View>
                ) : (
                    listings.map((p) => (
                        <Pressable key={p.id} style={styles.productCard} onPress={() => router.push(`/product/${p.id}`)}>
                            <Image source={{ uri: (p.images && p.images[0]) || p.image || 'https://via.placeholder.com/60x60?text=Yok' }} style={styles.productImage} />
                            <View style={styles.productInfo}>
                                <Text style={styles.productTitle}>{p.title}</Text>
                                <Text style={styles.productPrice}>{p.price} TL / {p.unit}</Text>
                                <View style={styles.statusContainer}>
                                    <View style={styles.activeBadge}>
                                        <Text style={styles.activeBadgeText}>Yayında</Text>
                                    </View>
                                    <Text style={styles.dateText}>
                                        {p.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : ''}
                                    </Text>
                                </View>
                            </View>
                            <Pressable style={styles.deleteButton} onPress={(e) => {
                                e.stopPropagation();
                                handleDelete(p.id);
                            }}>
                                <Ionicons name="trash-outline" size={20} color={Colors.error || '#FF3B30'} />
                            </Pressable>
                        </Pressable>
                    ))
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.white,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'center',
        marginRight: 40, // Balance back button
    },
    content: {
        flex: 1,
        padding: 16,
    },
    productCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: Colors.border,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: Colors.text,
        marginBottom: 4,
    },
    productPrice: {
        color: Colors.primary,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    activeBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    activeBadgeText: {
        color: '#2E7D32',
        fontSize: 12,
        fontWeight: '500',
    },
    dateText: {
        color: Colors.textSecondary,
        fontSize: 12,
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 64,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 16,
        marginTop: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    createButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    createButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    }
});
