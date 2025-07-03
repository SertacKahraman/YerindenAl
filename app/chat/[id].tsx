import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, Linking, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

// Arka plan için kullanılacak ikonlar ve renkler (daha fazla ikon)
const BG_ICONS = [
    { name: 'chatbubble', color: '#a5b4fc' },
    { name: 'heart', color: '#fca5a5' },
    { name: 'star', color: '#fde68a' },
    { name: 'happy', color: '#fcd34d' },
    { name: 'thumbs-up', color: '#6ee7b7' },
    { name: 'send', color: '#93c5fd' },
    { name: 'sparkles', color: '#f9a8d4' },
    { name: 'cloud', color: '#bae6fd' },
    { name: 'chatbubble-ellipses', color: '#818cf8' },
    { name: 'flame', color: '#f87171' },
    { name: 'leaf', color: '#6ee7b7' },
    { name: 'moon', color: '#fbbf24' },
    { name: 'sunny', color: '#fde68a' },
    { name: 'flower', color: '#f9a8d4' },
    { name: 'balloon', color: '#93c5fd' },
    { name: 'planet', color: '#bae6fd' },
];

// Tarih etiketi için yardımcı fonksiyonlar
function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

function getDateLabel(date: Date) {
    if (!date || isNaN(date.getTime())) return '';
    const now = new Date();
    if (isSameDay(date, now)) return 'Bugün';
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (isSameDay(date, yesterday)) return 'Dün';
    // Son 7 gün için 'X gün önce'
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 1 && diffDays <= 7) {
        return `${diffDays} gün önce`;
    }
    // Daha eski ise tam tarih
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Okundu bilgisi için yardımcı fonksiyon
function getOtherUserId(users: string[], myId: string) {
    return users.find((uid) => uid !== myId);
}

// Mesajları günlere göre grupla (optimistik mesajlar dahil)
function groupMessagesByDateAll(messages: any[]) {
    const groups: { dateLabel: string, messages: any[] }[] = [];
    let lastDateLabel = '';
    messages.forEach(msg => {
        const date = msg.createdAt && msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
        const dateLabel = getDateLabel(date);
        if (dateLabel !== lastDateLabel) {
            groups.push({ dateLabel, messages: [msg] });
            lastDateLabel = dateLabel;
        } else {
            groups[groups.length - 1].messages.push(msg);
        }
    });
    return groups;
}

function groupMessagesByDateWithOptimistic(messages: any[]) {
    const realMessages = messages.filter(m => !m._optimistic);
    const optimisticMessages = messages.filter(m => m._optimistic);

    // Gerçek mesajları günlere göre grupla
    const groups: { dateLabel: string, messages: any[] }[] = [];
    let lastDateLabel = '';
    realMessages.forEach(msg => {
        const date = msg.createdAt && msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
        const dateLabel = getDateLabel(date);
        if (dateLabel !== lastDateLabel) {
            groups.push({ dateLabel, messages: [msg] });
            lastDateLabel = dateLabel;
        } else {
            groups[groups.length - 1].messages.push(msg);
        }
    });

    // Optimistik mesajları bugünün grubuna ekle
    if (optimisticMessages.length > 0) {
        const todayLabel = getDateLabel(new Date());
        let todayGroup = groups.find(g => g.dateLabel === todayLabel);
        if (!todayGroup) {
            todayGroup = { dateLabel: todayLabel, messages: [] };
            groups.push(todayGroup);
        }
        todayGroup.messages.push(...optimisticMessages);
    }

    return groups;
}

export default function ChatScreen() {
    const params = useLocalSearchParams();
    const chatId = params.id as string | undefined;
    const isNewChat = !chatId || chatId === 'new';
    const sellerId = params.sellerId as string | undefined;
    const productId = params.productId as string | undefined;
    const sellerNameParam = params.sellerName as string | undefined;
    const sellerPhotoParam = params.sellerPhoto as string | undefined;
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [otherUser, setOtherUser] = useState<any>(sellerNameParam || sellerPhotoParam ? { name: sellerNameParam, photoURL: sellerPhotoParam } : null);
    const [chatDocData, setChatDocData] = useState<any>(null);
    const [localChatId, setLocalChatId] = useState<string | undefined>(!isNewChat ? chatId : undefined);
    const flatListRef = useRef<FlatList>(null);
    const router = useRouter();
    const [sending, setSending] = useState(false);
    const [showScrollToEnd, setShowScrollToEnd] = useState(false);
    const insets = useSafeAreaInsets();
    const [product, setProduct] = useState<any>(null);

    if ((isNewChat && !sellerId) || !user) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 18 }}>Sohbet başlatmak için gerekli bilgiler eksik.</Text>
            </SafeAreaView>
        );
    }

    useEffect(() => {
        if (localChatId && user) {
            // Mevcut chatId ile diğer kullanıcıyı çek
            const fetchChatAndOtherUser = async () => {
                const chatRef = doc(db, 'chats', String(localChatId));
                const chatSnap = await getDoc(chatRef);
                if (chatSnap.exists()) {
                    const data = chatSnap.data();
                    setChatDocData(data);
                    const otherUserId = getOtherUserId(data.users, user.id);
                    if (otherUserId) {
                        const userDoc = await getDoc(doc(db, 'users', otherUserId));
                        setOtherUser((prev: any) => ({
                            ...prev,
                            ...(userDoc.exists() ? userDoc.data() : {}),
                            photoURL: (userDoc.exists() ? userDoc.data().photoURL : prev?.photoURL),
                            name: (userDoc.exists() ? (userDoc.data().name || userDoc.data().email) : prev?.name),
                        }));
                    }
                }
            };
            fetchChatAndOtherUser();
        } else if (!localChatId && sellerId) {
            // Yeni sohbet: sellerId ile satıcıyı çek
            const fetchSeller = async () => {
                const userDoc = await getDoc(doc(db, 'users', sellerId));
                setOtherUser((prev: any) => ({
                    ...prev,
                    ...(userDoc.exists() ? userDoc.data() : {}),
                    photoURL: (userDoc.exists() ? userDoc.data().photoURL : prev?.photoURL),
                    name: (userDoc.exists() ? (userDoc.data().name || userDoc.data().email) : prev?.name),
                }));
            };
            fetchSeller();
        }
    }, [localChatId, user, sellerId]);

    useEffect(() => {
        if (!localChatId) return;
        const q = query(
            collection(db, 'messages'),
            where('chatId', '==', String(localChatId)),
            orderBy('createdAt', 'asc')
        );
        const unsubscribe = onSnapshot(q, (snap) => {
            const items: any[] = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            setMessages(items);
            console.log('Messages snapshot:', items.map(i => i.text));
        });
        return unsubscribe;
    }, [localChatId]);

    useEffect(() => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages]);

    // Sohbet açıldığında kendi lastRead alanını güncelle
    useEffect(() => {
        if (!localChatId || !user?.id || !messages.length) return;
        const lastMsg = messages[messages.length - 1];
        if (!lastMsg) return;
        const chatRef = doc(db, 'chats', String(localChatId));
        updateDoc(chatRef, {
            [`lastRead.${user.id}`]: lastMsg.createdAt || new Date(),
        });
    }, [localChatId, user, messages.length]);

    // localChatId değiştiğinde parametreyle gelen sellerName/sellerPhoto'yu tekrar state'e yaz
    useEffect(() => {
        if (sellerNameParam || sellerPhotoParam) {
            setOtherUser((prev: any) => ({
                ...prev,
                name: sellerNameParam || prev?.name,
                photoURL: sellerPhotoParam || prev?.photoURL,
            }));
        }
    }, [localChatId]);

    // Chat objesi yüklendiğinde ürün bilgisini çek
    useEffect(() => {
        async function fetchProduct() {
            if (chatDocData && chatDocData.productId) {
                const ref = doc(db, 'products', String(chatDocData.productId));
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    setProduct({ id: snap.id, ...snap.data() });
                } else {
                    setProduct(null);
                }
            } else {
                setProduct(null);
            }
        }
        fetchProduct();
    }, [chatDocData]);

    const handleSend = async () => {
        if (!input.trim() || !user || sending) return;
        setSending(true);
        let usedChatId = localChatId;
        let createdNewChat = false;
        let productInfo = null;
        if (!usedChatId && sellerId) {
            // Aynı kullanıcılar arasında daha önce chat var mı kontrol et
            const chatsRef = collection(db, 'chats');
            let q = query(
                chatsRef,
                where('users', 'array-contains', user.id)
            );
            const querySnapshot = await getDocs(q);
            let foundChatId: string | undefined = undefined;
            querySnapshot.forEach(docSnap => {
                const data = docSnap.data();
                if (data.users.includes(sellerId) && (!productId || data.productId === productId)) {
                    foundChatId = docSnap.id;
                }
            });
            if (foundChatId) {
                usedChatId = foundChatId;
                setLocalChatId(foundChatId);
            } else {
                // Ürün bilgilerini Firestore'dan çek
                if (productId) {
                    const ref = doc(db, 'products', String(productId));
                    const snap = await getDoc(ref);
                    if (snap.exists()) {
                        const pdata = snap.data();
                        productInfo = {
                            productId,
                            productTitle: pdata.title,
                            productImage: pdata.image || (pdata.images && pdata.images[0]) || '',
                            productPrice: pdata.price,
                        };
                    }
                }
                // Yeni chat oluştur
                const newChat = {
                    users: [user.id, sellerId],
                    lastMessage: input,
                    lastMessageAt: serverTimestamp(),
                    ...(productId ? { productId } : {}),
                    ...(productInfo ? productInfo : {}),
                };
                const docRef = await addDoc(collection(db, 'chats'), newChat);
                usedChatId = docRef.id;
                setLocalChatId(docRef.id);
                createdNewChat = true;
            }
        }
        const newMessage = {
            chatId: String(usedChatId),
            senderId: user.id,
            text: input,
            createdAt: new Date(),
            id: Math.random().toString(36).substr(2, 9),
            _optimistic: true,
        };
        setMessages(prev => [...prev, newMessage]);
        setInput('');
        try {
            console.log('Kullanılan chatId:', usedChatId);
            await addDoc(collection(db, 'messages'), {
                chatId: String(usedChatId),
                senderId: user.id,
                text: newMessage.text,
                createdAt: serverTimestamp(),
            });
            console.log('Mesaj eklendi:', {
                chatId: String(usedChatId),
                senderId: user.id,
                text: newMessage.text,
            });
            await updateDoc(doc(db, 'chats', String(usedChatId)), {
                lastMessage: newMessage.text,
                lastMessageAt: serverTimestamp(),
            });
            if (createdNewChat && usedChatId) {
                router.replace({
                    pathname: '/chat/[id]',
                    params: {
                        id: usedChatId,
                        sellerName: sellerNameParam,
                        sellerPhoto: sellerPhotoParam,
                        sellerId,
                        productId,
                    },
                });
            }
        } finally {
            setSending(false);
        }
    };

    // Mesaj saatini formatla
    function formatTime(date: any) {
        if (!date) return '';
        try {
            const d = date.toDate ? date.toDate() : new Date(date);
            if (!d || isNaN(d.getTime())) return '';
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    }

    // Y eksenini 5 şeride bölerek, her şeritte eşit ve minimum mesafeli ikon dağılımı
    const bgIconsMemo = useMemo(() => {
        const icons = [];
        const minDist = 44; // px
        const maxTry = 30;
        const stripes = 5;
        const iconsPerStripe = 7;
        const width = 380; // px (tahmini ekran genişliği)
        const { height: windowHeight } = Dimensions.get('window');
        const height = windowHeight;
        const stripeHeight = height / stripes;
        let iconIndex = 0;
        for (let s = 0; s < stripes; s++) {
            // Son şerit için topMax'i ekranın en altına kadar genişlet
            const topMin = s * stripeHeight + 10;
            const topMax = (s === stripes - 1)
                ? height - 70 // Son şerit: mesaj yazma kutusunun üstüne kadar inebilsin
                : (s + 1) * stripeHeight - 40;
            const stripeIcons = [];
            for (let i = 0; i < iconsPerStripe; i++) {
                const icon = BG_ICONS[iconIndex % BG_ICONS.length];
                iconIndex++;
                let placed = false;
                let tryCount = 0;
                let left = 0, top = 0, size = 0;
                while (!placed && tryCount < maxTry) {
                    size = Math.floor(28 + Math.random() * 28);
                    left = 10 + Math.random() * (width - size - 20);
                    top = topMin + Math.random() * (topMax - topMin);
                    // Minimum mesafe kontrolü (sadece bu stripe içindeki ikonlarla)
                    let tooClose = false;
                    for (const other of stripeIcons) {
                        const dx = (left + size / 2) - (other.left + other.size / 2);
                        const dy = (top + size / 2) - (other.top + other.size / 2);
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDist) {
                            tooClose = true;
                            break;
                        }
                    }
                    if (!tooClose) placed = true;
                    tryCount++;
                }
                const iconObj = { ...icon, size, left, top };
                icons.push(iconObj);
                stripeIcons.push(iconObj);
            }
        }
        return icons;
    }, []);

    // Mesaj balonuna uzun basınca menü
    const handleMessageLongPress = (item: any) => {
        const isMe = item.senderId === user?.id;
        const options = [
            'Kopyala',
            ...(isMe ? ['Sil'] : []),
            'İptal',
        ];
        Alert.alert(
            'Mesaj',
            '',
            options.map((opt, idx) => ({
                text: opt,
                onPress: async () => {
                    if (opt === 'Kopyala') {
                        Clipboard.setStringAsync(item.text);
                    } else if (opt === 'Sil' && isMe) {
                        try {
                            await deleteDoc(doc(db, 'messages', item.id));
                        } catch (e) {
                            Alert.alert('Hata', 'Mesaj silinemedi.');
                        }
                    }
                },
                style: opt === 'İptal' ? 'cancel' : 'default',
            }))
        );
    };

    // FlatList'te scroll eventini dinle
    const handleListScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
        setShowScrollToEnd(!isAtBottom && messages.length > 0);
    };

    const scrollToEnd = () => {
        flatListRef.current?.scrollToEnd({ animated: true });
    };

    const groupedMessages = useMemo(() => groupMessagesByDateAll(messages), [messages]);

    const handleCallSeller = () => {
        if (otherUser?.phone) {
            Linking.openURL(`tel:${otherUser.phone}`);
        } else {
            Alert.alert('Telefon numarası bulunamadı');
        }
    };

    const handleGoToUserProfile = () => {
        if (otherUser?.id) {
            Alert.alert('Tıklandı', `Kullanıcı id: ${otherUser.id}`);
            router.push({ pathname: '/seller/[id]', params: { id: otherUser.id } });
        } else {
            Alert.alert('id yok', JSON.stringify(otherUser));
        }
    };

    const handleEmojiPress = () => {
        if (Platform.OS === 'web') {
            window.alert('Emoji picker açılacak!');
        } else {
            Alert.alert('Emoji', 'Emoji picker açılacak!');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: Colors.primary }}>
            {/* Header */}
            <View style={{
                backgroundColor: Colors.primary,
                paddingTop: 36,
                paddingBottom: 64,
                alignItems: 'center',
                borderBottomLeftRadius: 32,
                borderBottomRightRadius: 32,
                flexDirection: 'row',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                overflow: 'hidden',
                pointerEvents: 'box-none',
            }}>
                {/* Header arka planına karo (diyagonal/kafes) desen */}
                <View style={{ position: 'absolute', left: 0, top: 0, width: '140%', height: '180%', zIndex: 0, transform: [{ rotate: '45deg' }] }} pointerEvents="none">
                    {[...Array(7)].map((_, i) => (
                        <View
                            key={'karo1-' + i}
                            style={{
                                position: 'absolute',
                                top: i * 48,
                                left: 0,
                                width: '100%',
                                height: 4,
                                backgroundColor: 'rgba(255,255,255,0.10)',
                                borderRadius: 2,
                            }}
                        />
                    ))}
                    {[...Array(7)].map((_, i) => (
                        <View
                            key={'karo2-' + i}
                            style={{
                                position: 'absolute',
                                left: i * 48,
                                top: 0,
                                width: 4,
                                height: '100%',
                                backgroundColor: 'rgba(255,255,255,0.10)',
                                borderRadius: 2,
                            }}
                        />
                    ))}
                </View>
                {/* Sol buton */}
                <View style={{ position: 'absolute', left: 12, top: 44, zIndex: 1 }}>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color={Colors.white} />
                    </Pressable>
                </View>
                {/* Sağ buton */}
                <View style={{ position: 'absolute', right: 18, top: 44, zIndex: 1 }}>
                    <Pressable onPress={handleCallSeller} style={{ backgroundColor: Colors.primary, borderRadius: 20, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)' }}>
                        <Ionicons name="call" size={24} color={Colors.white} />
                    </Pressable>
                </View>
                {/* Ortada tıklanabilir profil alanı - header'ın en sonunda, en üstte */}
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                        source={{ uri: otherUser?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(otherUser?.name || otherUser?.email || 'Kullanıcı') }}
                        style={{ width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: Colors.white, marginBottom: 16 }}
                    />
                    <Text style={{ color: Colors.white, fontWeight: 'bold', fontSize: 18 }}>{otherUser ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.name || otherUser.email : ''}</Text>
                </View>
            </View>
            {/* İçerik (mesajlar ve input) */}
            <View style={{
                flex: 1,
                backgroundColor: Colors.background,
                borderTopLeftRadius: 48,
                borderTopRightRadius: 48,
                marginTop: -40,
                zIndex: 2,
                overflow: 'visible',
            }}>
                {/* Mesajlar ve input barın üstünde ürün kartı */}
                {product && (
                    <View style={{
                        marginHorizontal: 16,
                        marginTop: 16,
                        marginBottom: 8,
                        borderRadius: 24,
                        backgroundColor: Colors.background,
                        shadowColor: Colors.primaryDark,
                        shadowOpacity: 0.13,
                        shadowRadius: 14,
                        shadowOffset: { width: 0, height: 6 },
                        elevation: 6,
                        borderWidth: 1.5,
                        borderColor: Colors.primaryLight + '33',
                        overflow: 'visible',
                    }}>
                        {/* Gradient bar üstte, daha kalın ve belirgin */}
                        <LinearGradient colors={[Colors.primary, Colors.primaryLight]} start={[0, 0]} end={[1, 1]} style={{ height: 13, borderTopLeftRadius: 24, borderTopRightRadius: 24 }} />
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 16,
                            gap: 16,
                            borderRadius: 20,
                            margin: 6,
                            shadowColor: Colors.primary + '22',
                            shadowOpacity: 0.10,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 2 },
                            borderWidth: 1,
                            borderColor: Colors.primaryLight + '22',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            <Image source={{ uri: product.image || (product.images && product.images[0]) }} style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary + '22', zIndex: 1 }} />
                            <View style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 17, color: Colors.primary, marginBottom: 2 }} numberOfLines={1}>{product.title}</Text>
                                <Text style={{ color: Colors.primaryLight, fontSize: 16, fontWeight: 'bold' }}>{product.price} TL</Text>
                            </View>
                            <Pressable onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })} style={{ backgroundColor: Colors.primary, borderRadius: 10, padding: 10, marginLeft: 4, shadowColor: Colors.primaryDark, shadowOpacity: 0.18, shadowRadius: 4, elevation: 2, zIndex: 1 }}>
                                <Ionicons name="arrow-forward" size={22} color={Colors.white} />
                            </Pressable>
                        </View>
                    </View>
                )}
                <FlatList
                    ref={flatListRef}
                    data={groupedMessages}
                    keyExtractor={group => group.dateLabel + (group.messages[0]?.id || '')}
                    onScroll={handleListScroll}
                    scrollEventThrottle={16}
                    renderItem={({ item: group }) => (
                        <>
                            {/* Tarih etiketi */}
                            <View style={{ alignItems: 'center', marginVertical: 10 }}>
                                <View style={{ backgroundColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 4 }}>
                                    <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 13 }}>{group.dateLabel}</Text>
                                </View>
                            </View>
                            {group.messages.map((item: any, idx: number) => {
                                const isMe = item.senderId === user?.id;
                                // Okundu bilgisi: Son kendi mesajın ve karşı tarafın lastRead'i bu mesajdan sonra mı?
                                let showRead = false;
                                if (isMe && item === group.messages[group.messages.length - 1] && chatDocData && chatDocData.lastRead && user?.id) {
                                    const otherId = chatDocData.users && getOtherUserId(chatDocData.users, user.id);
                                    const lastRead = chatDocData.lastRead && chatDocData.lastRead[otherId];
                                    if (lastRead) {
                                        let msgTime: number;
                                        if (item.createdAt && item.createdAt.toDate) {
                                            msgTime = item.createdAt.toDate().getTime();
                                        } else if (item.createdAt && item.createdAt !== null && item.createdAt !== undefined) {
                                            msgTime = new Date(item.createdAt).getTime();
                                        } else {
                                            msgTime = Date.now();
                                        }
                                        let readTime: number;
                                        if (lastRead && lastRead.toDate) {
                                            readTime = lastRead.toDate().getTime();
                                        } else if (lastRead && lastRead !== null && lastRead !== undefined) {
                                            readTime = new Date(lastRead).getTime();
                                        } else {
                                            readTime = Date.now();
                                        }
                                        if (readTime >= msgTime) showRead = true;
                                    }
                                }
                                // Saat ve gün bilgisini birlikte göster
                                let timeStr = formatTime(item.createdAt) || '';
                                let dateStr = '';
                                try {
                                    const d = item.createdAt && item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
                                    dateStr = getDateLabel(d);
                                } catch { dateStr = ''; }
                                return (
                                    <View key={item.id} style={{ flexDirection: 'row', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                                        <View
                                            style={{
                                                maxWidth: '75%',
                                                backgroundColor: isMe ? Colors.primary : Colors.background,
                                                borderRadius: 18,
                                                borderBottomRightRadius: isMe ? 8 : 18,
                                                borderBottomLeftRadius: isMe ? 18 : 8,
                                                paddingHorizontal: 16,
                                                paddingVertical: 12,
                                                marginLeft: isMe ? 40 : 0,
                                                marginRight: isMe ? 0 : 40,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    color: isMe ? Colors.white : Colors.text,
                                                    fontWeight: '400',
                                                    marginBottom: 8,
                                                }}
                                            >
                                                {item.text}
                                            </Text>
                                            <View
                                                style={{
                                                    alignSelf: 'flex-end',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    minHeight: 18,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 12,
                                                        color: isMe ? Colors.background : Colors.textSecondary,
                                                        fontWeight: '500',
                                                        letterSpacing: 0.1,
                                                    }}
                                                >
                                                    {timeStr}
                                                </Text>
                                                {showRead && (
                                                    <Ionicons name="checkmark-done" size={16} color={isMe ? Colors.white : Colors.primary} style={{ marginLeft: 4 }} />
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </>
                    )}
                    contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 64 }}>
                            <Ionicons name="chatbubble-ellipses-outline" size={56} color={Colors.primary + '55'} style={{ marginBottom: 12 }} />
                            <Text style={{ color: Colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
                                Henüz mesaj yok. İlk mesajı sen gönder!
                            </Text>
                        </View>
                    }
                />
                {/* Input bar */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                    position: 'relative',
                    minHeight: 68,
                    paddingBottom: 24 + insets.bottom,
                }}>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: Colors.background,
                        borderRadius: 32,
                        paddingHorizontal: 18,
                        paddingVertical: 8,
                        shadowColor: '#000',
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        elevation: 2,
                        borderWidth: 2,
                        borderColor: Colors.border,
                        minHeight: 48,
                    }}>
                        <TextInput
                            style={{
                                flex: 1,
                                fontSize: 16,
                                color: Colors.text,
                                backgroundColor: 'transparent',
                                borderWidth: 0,
                                paddingVertical: 0,
                                paddingHorizontal: 0,
                                paddingRight: 56,
                                height: 48,
                                lineHeight: 48,
                            }}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Mesaj yaz..."
                            placeholderTextColor={Colors.textSecondary}
                            multiline={false}
                            blurOnSubmit={false}
                            onKeyPress={(e) => {
                                if (e.nativeEvent.key === 'Enter') {
                                    e.preventDefault?.();
                                    handleSend();
                                }
                            }}
                        />
                        <Pressable onPress={handleEmojiPress} style={{ marginHorizontal: 6 }}>
                            <Ionicons name="happy-outline" size={22} color={Colors.textSecondary} />
                        </Pressable>
                    </View>
                    <TouchableOpacity
                        onPress={handleSend}
                        style={{
                            backgroundColor: Colors.primary,
                            borderRadius: 24,
                            width: 48,
                            height: 48,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 6,
                            borderWidth: 2,
                            borderColor: Colors.primary,
                        }}
                        disabled={sending || !input.trim()}
                    >
                        {sending ? (
                            <ActivityIndicator size={20} color={Colors.white} />
                        ) : (
                            <Ionicons name="send" size={22} color={Colors.white} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { flex: 1, backgroundColor: 'transparent' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: 'rgba(255,255,255,0.95)',
        zIndex: 2,
    },
    backButton: { padding: 8, marginRight: 8 },
    headerUser: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8, backgroundColor: Colors.border },
    headerUserName: { fontSize: 17, fontWeight: 'bold', color: Colors.text },
    messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
    myRow: { justifyContent: 'flex-end' },
    otherRow: { justifyContent: 'flex-start' },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 18,
        shadowColor: Colors.black,
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    myBubble: {
        backgroundColor: Colors.primary,
        marginLeft: 40,
        borderBottomRightRadius: 6,
    },
    otherBubble: {
        backgroundColor: Colors.white,
        marginRight: 8,
        borderBottomLeftRadius: 6,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    bubbleText: { fontSize: 16, flexShrink: 1, flexWrap: 'wrap' },
    myText: { color: Colors.white },
    otherText: { color: Colors.text },
    bubbleTime: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, textAlign: 'right' },
    bubbleAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8, backgroundColor: Colors.border },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingBottom: 32,
    },
    input: {
        flex: 1,
        fontSize: 16,
        backgroundColor: Colors.white,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        color: Colors.text,
    },
    sendBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 44,
        minHeight: 44,
    },
    bgIconContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    dateLabelRow: {
        alignItems: 'center',
        marginVertical: 8,
    },
    dateLabelText: {
        backgroundColor: Colors.primary + '22',
        color: Colors.primary,
        fontSize: 13,
        fontWeight: 'bold',
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    scrollToEndBtnWrap: {
        position: 'absolute',
        right: 18,
        bottom: 90,
        zIndex: 10,
        elevation: 10,
    },
    scrollToEndBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 24,
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.black,
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: 'rgba(255,255,255,0.95)',
        zIndex: 2,
    },
    headerBackBtn: { padding: 8, marginRight: 8 },
    headerUserInfo: { flexDirection: 'row', alignItems: 'center' },
    headerAvatarFallback: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 8,
        backgroundColor: '#e0e7ef',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerAvatarFallbackText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 18,
    },
    headerAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8, backgroundColor: Colors.border },
}); 