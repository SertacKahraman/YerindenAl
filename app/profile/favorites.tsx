import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc as firestoreDoc, getDocs, getDoc as getFirestoreDoc, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function FavoritesScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
            const q = query(collection(db, 'products'), where('__name__', 'in', favIds.slice(0, 10)));
            const snap = await getDocs(q);
            const items: any[] = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            setFavoriteProducts(items);
            setLoading(false);
        }
        fetchFavorites();
    }, [user]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Favorilerim</Text>
            </View>
            <ScrollView style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={Colors.primary} />
                ) : favoriteProducts.length === 0 ? (
                    <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 32 }}>Henüz favori ürününüz yok.</Text>
                ) : (
                    favoriteProducts.map((p) => (
                        <Pressable key={p.id} style={styles.productCard} onPress={() => router.push(`/product/${p.id}`)}>
                            <Image source={{ uri: (p.images && p.images[0]) || p.image || 'https://via.placeholder.com/60x60?text=Yok' }} style={styles.productImage} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.productTitle}>{p.title}</Text>
                                <Text style={styles.productPrice}>{p.price} TL / {p.unit}</Text>
                                <Text style={styles.productLocation}>{p.location}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={22} color={Colors.primary} style={{ marginLeft: 8 }} />
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
    },
    backButton: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
        padding: 8
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    productCard: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 16,
        backgroundColor: Colors.border,
    },
    productTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: Colors.text,
    },
    productPrice: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    productLocation: {
        color: Colors.textSecondary,
        fontSize: 13,
    },
}); 