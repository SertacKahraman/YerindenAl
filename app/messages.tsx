import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../config/firebase';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

export default function MessagesScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [chats, setChats] = useState<any[]>([]);
    const [userNames, setUserNames] = useState<{ [chatId: string]: string }>({});
    const [userAvatars, setUserAvatars] = useState<{ [chatId: string]: string | undefined }>({});
    const [loading, setLoading] = useState(true);
    const [chatProducts, setChatProducts] = useState<{ [chatId: string]: any }>({});

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const q = query(
            collection(db, 'chats'),
            where('users', 'array-contains', user.id)
        );
        const unsubscribe = onSnapshot(q, async (snap) => {
            const items: any[] = [];
            const names: { [chatId: string]: string } = {};
            const avatars: { [chatId: string]: string | undefined } = {};
            for (const docSnap of snap.docs) {
                const data = docSnap.data();
                items.push({ id: docSnap.id, ...data });
                const otherUserId = (data.users || []).find((uid: string) => uid !== user.id);
                if (otherUserId) {
                    const userDoc = await getDoc(doc(db, 'users', otherUserId));
                    names[docSnap.id] = userDoc.exists() ? ((userDoc.data().firstName || '') + ' ' + (userDoc.data().lastName || '')).trim() || userDoc.data().name || userDoc.data().email || otherUserId : otherUserId;
                    avatars[docSnap.id] = userDoc.exists() ? userDoc.data().photoURL : undefined;
                } else {
                    names[docSnap.id] = 'Bilinmeyen Kullanıcı';
                    avatars[docSnap.id] = undefined;
                }
            }
            setChats(items);
            setUserNames(names);
            setUserAvatars(avatars);
            setLoading(false);
            console.log('Chats snapshot:', items.map(i => i.id));
        });
        return unsubscribe;
    }, [user]);

    useEffect(() => {
        async function fetchProductsForChats() {
            const productIds = chats.map(c => c.productId).filter(Boolean);
            const uniqueIds = Array.from(new Set(productIds));
            if (uniqueIds.length === 0) {
                setChatProducts({});
                return;
            }
            // Firestore toplu çekim (max 10 id)
            const batchSize = 10;
            let productsMap: { [id: string]: any } = {};
            for (let i = 0; i < uniqueIds.length; i += batchSize) {
                const batchIds = uniqueIds.slice(i, i + batchSize);
                const q = query(collection(db, 'products'), where('__name__', 'in', batchIds));
                const snap = await getDocs(q);
                snap.forEach(docSnap => {
                    productsMap[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
                });
            }
            const chatProductMap: { [chatId: string]: any } = {};
            chats.forEach(chat => {
                if (chat.productId && productsMap[chat.productId]) {
                    chatProductMap[chat.id] = productsMap[chat.productId];
                }
            });
            setChatProducts(chatProductMap);
        }
        if (chats.length > 0) fetchProductsForChats();
    }, [chats]);

    const handleChatPress = (chatId: string, name: string, photoURL?: string) => {
        router.push({ pathname: '/chat/[id]', params: { id: chatId, sellerName: name, sellerPhoto: photoURL } });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerRow}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Mesajlarım</Text>
            </View>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => {
                        const avatarUrl = userAvatars[item.id];
                        const name = userNames[item.id] || 'Sohbet';
                        const displayName = name.trim() || 'Sohbet';
                        const unreadCount = item.unreadCount || 0;
                        let lastTime = '';
                        let lastDate = '';
                        if (item.lastMessageAt?.toDate) {
                            const d = item.lastMessageAt.toDate();
                            lastTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            lastDate = d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        }
                        const product = item.productTitle ? {
                            title: item.productTitle,
                            image: item.productImage,
                            price: item.productPrice
                        } : chatProducts[item.id];
                        // Uygulama renkleri
                        const accent = Colors.primary;
                        const accent2 = Colors.primaryLight;
                        const accentBg = Colors.primary + '22';
                        const accentBorder = Colors.primary + '55';
                        return (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.chatItem,
                                    pressed && styles.chatItemPressed,
                                    {
                                        flexDirection: 'column',
                                        alignItems: 'stretch',
                                        padding: 0,
                                        overflow: 'visible',
                                        borderWidth: 0,
                                        shadowOpacity: 0.13,
                                        shadowRadius: 10,
                                        elevation: 4,
                                        marginBottom: 22,
                                        backgroundColor: pressed ? Colors.surface : '#fff',
                                        minHeight: 110,
                                        borderRadius: 22,
                                    }
                                ]}
                                onPress={() => handleChatPress(item.id, name, avatarUrl)}
                            >
                                {/* Üstte renkli gradient bar */}
                                <LinearGradient colors={[accent, accent2]} start={[0, 0]} end={[1, 1]} style={{ height: 8, borderTopLeftRadius: 22, borderTopRightRadius: 22 }} />
                                <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative', paddingTop: 2 }}>
                                    {/* Avatar */}
                                    <View style={{ marginLeft: 18, marginRight: 18, marginTop: -22, zIndex: 2, shadowColor: accent, shadowOpacity: 0.18, shadowRadius: 8, elevation: 3 }}>
                                        <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: accentBg, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: accent }}>
                                            {avatarUrl ? (
                                                <Image source={{ uri: avatarUrl }} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.border }} />
                                            ) : (
                                                <View style={styles.avatarFallback}>
                                                    <Text style={[styles.avatarFallbackText, { color: accent }]}>{displayName[0]?.toUpperCase() || '?'}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    {/* Orta içerik */}
                                    <View style={{ flex: 1, minWidth: 0, paddingVertical: 18, paddingRight: 16, justifyContent: 'center' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <Text style={{ fontSize: 17, fontWeight: 'bold', color: accent, flex: 1, letterSpacing: 0.1 }} numberOfLines={1}>{displayName}</Text>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={{ fontSize: 13, color: accent2, fontWeight: 'bold' }}>{lastTime}</Text>
                                                {lastDate && <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: '500', marginTop: 1 }}>{lastDate}</Text>}
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 15, color: Colors.textSecondary, flex: 1, fontWeight: '500' }} numberOfLines={1}>{item.lastMessage || 'Henüz mesaj yok.'}</Text>
                                            {unreadCount > 0 && (
                                                <View style={[styles.unreadBadge, { backgroundColor: accent2 }]}>
                                                    <Text style={styles.unreadBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                                {/* Ürün kutucuğu kartın altına, daha yuvarlak ve renkli */}
                                {product && (
                                    <View style={{ alignSelf: 'center', marginTop: 2, marginBottom: 10, backgroundColor: accentBg, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 16, gap: 10, shadowColor: accent, shadowOpacity: 0.10, shadowRadius: 2, elevation: 1, borderWidth: 1, borderColor: accentBorder, minWidth: 120 }}>
                                        <Image source={{ uri: product.image }} style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#fff', marginRight: 7, borderWidth: 1, borderColor: accentBorder }} />
                                        <Text style={{ fontSize: 14, color: accent, fontWeight: 'bold', maxWidth: 100 }} numberOfLines={1}>{product.title}</Text>
                                        <Text style={{ fontSize: 13, color: accent2, fontWeight: 'bold', marginLeft: 6 }}>{product.price} TL</Text>
                                    </View>
                                )}
                            </Pressable>
                        );
                    }}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 48 }}>
                            <Ionicons name="chatbubble-ellipses-outline" size={64} color={Colors.border} style={{ marginBottom: 12 }} />
                            <Text style={{ color: Colors.textSecondary, textAlign: 'center', fontSize: 16 }}>Henüz mesajınız yok.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.background,
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
        padding: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.primary,
        textAlign: 'center',
        flex: 1,
    },
    chatItem: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 72,
    },
    chatItemPressed: {
        backgroundColor: '#f3f4f6',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 14,
        backgroundColor: Colors.border,
    },
    avatarFallback: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 14,
        backgroundColor: '#e0e7ef',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarFallbackText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 22,
    },
    chatInfo: {
        flex: 1,
        minWidth: 0,
    },
    chatTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
    lastMessage: { fontSize: 15, color: Colors.textSecondary, marginBottom: 2 },
    lastMessageAt: { fontSize: 12, color: Colors.textSecondary },
    unreadBadge: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        paddingHorizontal: 5,
    },
    unreadBadgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
}); 