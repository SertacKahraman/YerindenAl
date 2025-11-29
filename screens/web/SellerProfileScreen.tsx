import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import WebFooter from '../../components/web/WebFooter';
import WebLayout from '../../components/web/WebLayout';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function SellerProfileScreenWeb() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { width } = useWindowDimensions();
    const [seller, setSeller] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const numColumns = width > 1200 ? 5 : width > 900 ? 4 : width > 600 ? 3 : 2;

    useEffect(() => {
        async function fetchSeller() {
            if (!id) return;
            setLoading(true);
            const sellerRef = doc(db, 'users', String(id));
            const sellerSnap = await getDoc(sellerRef);
            if (sellerSnap.exists()) {
                setSeller(sellerSnap.data());
                const q = query(collection(db, 'products'), where('seller.id', '==', String(id)));
                const snap = await getDocs(q);
                const items: any[] = [];
                snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
                setProducts(items);
            }
            setLoading(false);
        }
        fetchSeller();
    }, [id]);

    const handleContactSeller = async () => {
        if (!user) {
            alert('Sohbet başlatmak için giriş yapmalısınız.');
            return;
        }
        if (!seller || !id) {
            alert('Satıcı bilgisi eksik.');
            return;
        }
        if (user.id === id) {
            alert('Kendinize mesaj gönderemezsiniz.');
            return;
        }
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('users', 'array-contains', user.id));
        const querySnapshot = await getDocs(q);
        let foundChatId = null;
        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.users.includes(id)) {
                foundChatId = docSnap.id;
            }
        });
        if (foundChatId) {
            router.push({
                pathname: '/chat/[id]',
                params: {
                    id: foundChatId,
                    sellerName: seller?.name,
                    sellerPhoto: seller?.photoURL,
                    sellerId: id,
                }
            });
        } else {
            router.push({ pathname: '/chat/[id]', params: { id: 'new', sellerId: id, sellerName: seller?.name, sellerPhoto: seller?.photoURL } });
        }
    };

    if (loading) {
        return (
            <WebLayout>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </WebLayout>
        );
    }

    if (!seller) {
        return (
            <WebLayout>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Satıcı bulunamadı.</Text>
                </View>
            </WebLayout>
        );
    }

    const joinDate = seller.joinDate || seller.createdAt;

    return (
        <WebLayout showFooter={false}>
            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.content}>
                    {/* Seller Header Card */}
                    <View style={styles.sellerCard}>
                        <View style={styles.sellerHeader}>
                            <Image
                                source={{ uri: seller.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(seller.name || 'Satıcı') }}
                                style={styles.avatar}
                            />
                            <View style={styles.sellerInfo}>
                                <Text style={styles.sellerName}>{`${seller.firstName || ''} ${seller.lastName || ''}`.trim() || seller.name || 'Satıcı'}</Text>
                                <View style={styles.badges}>
                                    <View style={styles.badge}>
                                        <Ionicons name="star" size={14} color={Colors.primary} />
                                        <Text style={styles.badgeText}>Güvenilir Satıcı</Text>
                                    </View>
                                    {seller.address && (
                                        <View style={styles.badge}>
                                            <Ionicons name="location" size={14} color={Colors.primary} />
                                            <Text style={styles.badgeText}>{seller.address}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.stats}>
                                    <Text style={styles.statText}>{products.length} İlan</Text>
                                    <Text style={styles.statDivider}>•</Text>
                                    <Text style={styles.statText}>Katılım: {joinDate ? new Date(joinDate).toLocaleDateString() : '-'}</Text>
                                </View>
                            </View>
                            <Pressable style={styles.contactButton} onPress={handleContactSeller}>
                                <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.white} />
                                <Text style={styles.contactButtonText}>İletişime Geç</Text>
                            </Pressable>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Satıcının İlanları</Text>

                    {products.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Bu satıcının yayında ilanı yok.</Text>
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            {products.map((product) => (
                                <Pressable
                                    key={product.id}
                                    style={[styles.card, { width: `${100 / numColumns}%` }]}
                                    onPress={() => router.push(`/product/${product.id}`)}
                                >
                                    <Image source={{ uri: product.image }} style={styles.cardImage} />
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
        maxWidth: 1200,
        width: '100%',
        marginHorizontal: 'auto',
        padding: 24,
    },
    loadingContainer: {
        height: 500,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        height: 500,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: Colors.textSecondary,
    },
    sellerCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 32,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sellerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.border,
    },
    sellerInfo: {
        flex: 1,
    },
    sellerName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    badges: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    badgeText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    statDivider: {
        color: Colors.textSecondary,
    },
    contactButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    contactButtonText: {
        color: Colors.white,
        fontWeight: '600',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 24,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 16,
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
