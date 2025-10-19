import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/ProductCard';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} sn önce`;
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} gün önce`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} ay önce`;
    return `${Math.floor(diff / 31536000)} yıl önce`;
}

export default function SellerProfileScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [seller, setSeller] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

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

    const joinDate = seller?.joinDate || seller?.createdAt;

    const handleContactSeller = async () => {
        if (!user) {
            Alert.alert('Giriş gerekli', 'Sohbet başlatmak için giriş yapmalısınız.');
            return;
        }
        if (!seller || !id) {
            Alert.alert('Hata', 'Satıcı bilgisi eksik.');
            return;
        }
        // Kendi profiline mesaj göndermesini engelle
        if (user.id === id) {
            Alert.alert('Uyarı', 'Kendinize mesaj gönderemezsiniz.');
            return;
        }
        // Daha önce bu kullanıcı ve satıcı arasında chat var mı kontrol et
        const chatsRef = collection(db, 'chats');
        const q = query(
            chatsRef,
            where('users', 'array-contains', user.id)
        );
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

    if (!id) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 18 }}>Satıcı bulunamadı.</Text>
            </SafeAreaView>
        );
    }

    if (!seller) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 18 }}>Satıcı bilgisi yüklenemedi.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </Pressable>
                <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">Satıcı Profili</Text>
                <Pressable
                    onPress={handleContactSeller}
                    style={[styles.chatButton, (!id) && { opacity: 0.5 }]}
                    disabled={!id}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.primary} />
                </Pressable>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 0 }}>
                <View style={styles.profileTop}>
                    <Image
                        source={{ uri: seller?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(seller?.name || 'Satıcı') }}
                        style={styles.avatar}
                    />
                    <Text style={styles.sellerName}>{seller ? `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || seller?.name || 'Satıcı' : 'Satıcı'}</Text>
                    <View style={styles.badgeRow}>
                        <View style={styles.badge}><Ionicons name="star" size={14} color={Colors.primary} /><Text style={styles.badgeText}>Güvenilir Satıcı</Text></View>
                        {seller?.address && <View style={styles.badge}><Ionicons name="location" size={14} color={Colors.primary} /><Text style={styles.badgeText}>{seller.address}</Text></View>}
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoValue}>{products.length}</Text>
                            <Text style={styles.infoLabel}>İlan</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoValue}>{joinDate ? timeAgo(joinDate) : '-'}</Text>
                            <Text style={styles.infoLabel}>Katılım</Text>
                        </View>
                    </View>
                    <View style={styles.dateRow}>
                        <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
                        <Text style={styles.dateText}>Kayıt: {joinDate ? new Date(joinDate).toLocaleDateString() : '-'}</Text>
                    </View>
                </View>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Satıcının İlanları</Text>
                </View>
                {products.length === 0 ? (
                    <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 32 }}>Bu satıcının yayında ilanı yok.</Text>
                ) : (
                    <View style={styles.productsGrid}>
                        {products.map((p) => (
                            <ProductCard
                                key={p.id}
                                title={p.title}
                                price={parseFloat(p.price)}
                                image={(p.images && p.images[0]) || p.image || 'https://via.placeholder.com/60x60?text=Yok'}
                                location={p.location}
                                onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
        color: Colors.primary,
        letterSpacing: 0.5,
    },
    chatButton: {
        padding: 8,
        marginLeft: 8,
    },
    profileTop: {
        alignItems: 'center',
        backgroundColor: Colors.primary + '08',
        paddingVertical: 32,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        marginBottom: 12,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Colors.border,
        marginBottom: 12,
    },
    sellerName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 6,
    },
    badgeRow: {
        flexDirection: 'row',
        marginBottom: 10,
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary + '15',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginRight: 6,
    },
    badgeText: {
        color: Colors.primary,
        fontSize: 13,
        marginLeft: 4,
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 8,
    },
    infoBox: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 10,
        paddingHorizontal: 18,
        paddingVertical: 10,
        marginHorizontal: 4,
        shadowColor: Colors.primary,
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    infoValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    infoLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 6,
    },
    dateText: {
        color: Colors.textSecondary,
        fontSize: 13,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 8,
    },
}); 