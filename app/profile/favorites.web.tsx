import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc as firestoreDoc, getDocs, getDoc as getFirestoreDoc, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import WebLayout from '../../components/web/WebLayout';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function FavoritesScreenWeb() {
    const { user } = useAuth();
    const router = useRouter();
    const { width } = useWindowDimensions();
    const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const numColumns = width > 1200 ? 5 : width > 900 ? 4 : width > 600 ? 3 : 2;

    useEffect(() => {
        async function fetchFavorites() {
            if (!user) return;
            setLoading(true);
            const userRef = firestoreDoc(db, 'users', user.id);
            const userSnap = await getFirestoreDoc(userRef);
            const favIds = userSnap.exists() && userSnap.data().favorites ? userSnap.data().favorites : [];
            if (favIds.length === 0) {
                setFavoriteProducts([]);
                setLoading(false);
                return;
            }
            // Firestore 'in' query supports max 10 items. For more, we need to batch or fetch all and filter.
            // For simplicity in this demo, we'll take the first 10. In production, batching is needed.
            const q = query(collection(db, 'products'), where('__name__', 'in', favIds.slice(0, 10)));
            const snap = await getDocs(q);
            const items: any[] = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            setFavoriteProducts(items);
            setLoading(false);
        }
        fetchFavorites();
    }, [user]);

    if (!user) {
        return (
            <WebLayout>
                <View style={styles.centerContainer}>
                    <Text style={styles.messageText}>Favorilerinizi görmek için giriş yapmalısınız.</Text>
                </View>
            </WebLayout>
        );
    }

    return (
        <WebLayout>
            <ScrollView style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Favorilerim</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 40 }} />
                    ) : favoriteProducts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="heart-outline" size={64} color={Colors.textSecondary} />
                            <Text style={styles.emptyText}>Henüz favori ürününüz yok.</Text>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {favoriteProducts.map((product) => (
                                <Pressable
                                    key={product.id}
                                    style={[styles.card, { width: `${100 / numColumns}%` }]}
                                    onPress={() => router.push(`/product/${product.id}`)}
                                >
                                    <Image source={{ uri: (product.images && product.images[0]) || product.image }} style={styles.cardImage} />
                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle} numberOfLines={2}>{product.title}</Text>
                                        <Text style={styles.cardPrice}>{product.price} TL</Text>
                                        <View style={styles.cardLocation}>
                                            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                                            <Text style={styles.locationText}>{product.location}</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </WebLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        maxWidth: 1200,
        width: '100%',
        marginHorizontal: 'auto',
        padding: 24,
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
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 24,
    },
    emptyContainer: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 18,
        color: Colors.textSecondary,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    card: {
        padding: 8,
    },
    cardImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        backgroundColor: Colors.border,
        marginBottom: 8,
    },
    cardContent: {
        gap: 4,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
        height: 40,
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    cardLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
});
