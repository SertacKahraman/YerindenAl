import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, arrayRemove, arrayUnion, collection, doc, doc as firestoreDoc, getDoc, getDocs, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function ProductDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const { user } = useAuth();
    const [comments, setComments] = useState<any[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [rating, setRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    // Her yorum için animasyon state'i
    const likeAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const HEADER_MAX_HEIGHT = 300;
    const HEADER_MIN_HEIGHT = 80;
    const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            if (!id) return;
            const ref = doc(db, 'products', String(id));
            const snap = await getDoc(ref);
            if (snap.exists()) {
                setProduct({ id: snap.id, ...snap.data() });
            } else {
                setProduct(null);
            }
            setLoading(false);
        }
        fetchProduct();
    }, [id]);

    useEffect(() => {
        async function fetchComments() {
            if (!id) return;
            setCommentsLoading(true);
            const q = query(collection(db, 'comments'), where('productId', '==', String(id)), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            const items: any[] = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            setComments(items);
            setCommentsLoading(false);
        }
        fetchComments();
    }, [id]);

    useEffect(() => {
        // Yorumlar değiştiğinde animasyon state'lerini oluştur
        comments.forEach((c) => {
            if (!likeAnimations[c.id]) {
                likeAnimations[c.id] = new Animated.Value(1);
            }
        });
    }, [comments]);

    useEffect(() => {
        async function checkFavorite() {
            if (!user || !id) return setIsFavorite(false);
            const userRef = firestoreDoc(db, 'users', user.id);
            const userSnap = await getDoc(userRef);
            const favs = userSnap.exists() && userSnap.data().favorites ? userSnap.data().favorites : [];
            setIsFavorite(favs.includes(String(id)));
        }
        checkFavorite();
    }, [user, id]);

    const averageRating = comments.length > 0 ? (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length).toFixed(1) : null;

    const handleAddComment = async () => {
        if (!user) {
            Alert.alert('Giriş gerekli', 'Yorum eklemek için giriş yapmalısınız.');
            return;
        }
        if (!commentText.trim()) {
            Alert.alert('Hata', 'Yorum metni boş olamaz.');
            return;
        }
        setSubmitting(true);
        try {
            await addDoc(collection(db, 'comments'), {
                productId: String(id),
                userId: user.id,
                userName: user.name || user.email,
                rating,
                comment: commentText,
                createdAt: Timestamp.now(),
            });
            setCommentText('');
            setRating(5);
            const q = query(collection(db, 'comments'), where('productId', '==', String(id)), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            const items: any[] = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            setComments(items);
            Alert.alert('Başarılı', 'Yorumunuz eklendi!');
        } catch (e) {
            Alert.alert('Hata', 'Yorum eklenirken bir hata oluştu.');
        }
        setSubmitting(false);
    };

    // Yorum beğenme/geri çekme (like/unlike) fonksiyonu
    const handleLike = async (commentId: string, likes: string[] = []) => {
        if (!user) {
            Alert.alert('Giriş gerekli', 'Beğenmek için giriş yapmalısınız.');
            return;
        }
        // Animasyonu başlat
        if (likeAnimations[commentId]) {
            Animated.sequence([
                Animated.timing(likeAnimations[commentId], { toValue: 1.4, duration: 120, useNativeDriver: true }),
                Animated.timing(likeAnimations[commentId], { toValue: 1, duration: 120, useNativeDriver: true })
            ]).start();
        }
        const commentRef = firestoreDoc(db, 'comments', commentId);
        try {
            if (likes.includes(user.id)) {
                // Unlike (geri çek)
                await updateDoc(commentRef, {
                    likes: arrayRemove(user.id)
                });
            } else {
                // Like
                await updateDoc(commentRef, {
                    likes: arrayUnion(user.id)
                });
            }
            // Yorumları tekrar çek
            const q = query(collection(db, 'comments'), where('productId', '==', String(id)), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            const items: any[] = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            setComments(items);
        } catch (e) {
            Alert.alert('Hata', 'Beğeni işlemi sırasında bir hata oluştu.');
        }
    };

    // Favori ekle/çıkar fonksiyonu
    const handleToggleFavorite = async () => {
        if (!user) {
            Alert.alert('Giriş gerekli', 'Favorilere eklemek için giriş yapmalısınız.');
            return;
        }
        const userRef = firestoreDoc(db, 'users', user.id);
        try {
            if (isFavorite) {
                await updateDoc(userRef, { favorites: arrayRemove(String(id)) });
                setIsFavorite(false);
            } else {
                await updateDoc(userRef, { favorites: arrayUnion(String(id)) });
                setIsFavorite(true);
            }
        } catch (e) {
            Alert.alert('Hata', 'Favori işlemi sırasında bir hata oluştu.');
        }
    };

    // Ortalama puanı yıldızlarla gösteren yardımcı fonksiyon
    function renderStars(rating: number) {
        const fullStars = Math.floor(rating);
        const halfStar = rating - fullStars >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        const stars = [];
        for (let i = 0; i < fullStars; i++) {
            stars.push(<Ionicons key={i + 'full'} name="star" size={18} color={Colors.primary} />);
        }
        if (halfStar) {
            stars.push(<Ionicons key={'half'} name="star-half" size={18} color={Colors.primary} />);
        }
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Ionicons key={i + 'empty'} name="star-outline" size={18} color={Colors.primary} />);
        }
        return stars;
    }

    // Kullanıcı adını maskeleyen yardımcı fonksiyon
    function maskName(name: string, firstName?: string, lastName?: string) {
        let fullName = name;
        if (firstName || lastName) {
            fullName = `${firstName || ''} ${lastName || ''}`.trim();
        }
        if (!fullName) return '';
        const parts = fullName.split(' ');
        return parts.map(p => p[0] + '*'.repeat(Math.max(0, p.length - 1))).join(' ');
    }

    const handleContactSeller = async () => {
        if (!user) {
            Alert.alert('Giriş gerekli', 'Sohbet başlatmak için giriş yapmalısınız.');
            return;
        }
        if (!product || !product.seller || !product.seller.id || !product.id) {
            Alert.alert('Hata', 'Satıcı veya ürün bilgisi eksik.');
            return;
        }
        // Daha önce bu kullanıcı ve satıcı (ve ürün) arasında chat var mı kontrol et
        const chatsRef = collection(db, 'chats');
        const q = query(
            chatsRef,
            where('users', 'array-contains', user.id)
        );
        const querySnapshot = await getDocs(q);
        let foundChatId = null;
        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (
                data.users.includes(product.seller.id) &&
                (data.productId ? data.productId === product.id : true)
            ) {
                foundChatId = docSnap.id;
            }
        });
        if (foundChatId) {
            router.push({
                pathname: '/chat/[id]',
                params: {
                    id: foundChatId,
                    sellerName: product.seller.name,
                    sellerPhoto: product.seller.photoURL,
                    sellerId: product.seller.id,
                    productId: product.id,
                }
            });
        } else {
            router.push({ pathname: '/chat/[id]', params: { id: 'new', sellerId: product.seller.id, productId: product.id, sellerName: product.seller.name, sellerPhoto: product.seller.photoURL } });
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Ürün bulunamadı</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Çoklu görsel desteği yoksa tek görseli diziye çevir
    const images = product.images && Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [product.image];

    return (
        <SafeAreaView style={styles.container}>
            {/* Klasik sabit header bar */}
            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => {
                        if (router.canGoBack && router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/');
                        }
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </Pressable>
                {/* Daha kompakt ve şık arama textfield'ı */}
                <Pressable
                    onPress={() => router.push('/search')}
                    style={{ flex: 1, marginLeft: 10, marginRight: 10, backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, height: 34, justifyContent: 'center', paddingHorizontal: 10, minWidth: 0 }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 0 }}>
                        <Ionicons name="search" size={18} color={Colors.textSecondary} />
                        <Text style={{ color: Colors.textSecondary, marginLeft: 7, fontSize: 15, flexShrink: 1 }} numberOfLines={1}>
                            Ürün ara...
                        </Text>
                    </View>
                </Pressable>
                {/* Sağ köşe: Daha büyük favori ve paylaşma butonları */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Pressable onPress={handleToggleFavorite} style={{ padding: 8 }}>
                        <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={28} color={Colors.primary} />
                    </Pressable>
                    <Pressable onPress={() => Alert.alert('Paylaş', 'Paylaşma özelliği yakında aktif olacak.')} style={{ padding: 8 }}>
                        <Ionicons name="share-outline" size={25} color={Colors.primary} />
                    </Pressable>
                </View>
            </View>
            <ScrollView style={styles.content}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: images[selectedImageIndex] }}
                        style={styles.mainImage}
                    />
                    <View style={styles.thumbnailContainer}>
                        {images.map((image: any, index: any) => (
                            <Pressable
                                key={index}
                                style={[
                                    styles.thumbnail,
                                    selectedImageIndex === index && styles.selectedThumbnail
                                ]}
                                onPress={() => setSelectedImageIndex(index)}
                            >
                                <Image
                                    source={{ uri: image }}
                                    style={styles.thumbnailImage}
                                />
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{product.title}</Text>
                    <Text style={styles.price}>
                        {product.price} TL / {product.unit}
                    </Text>

                    <View style={styles.sellerInfo}>
                        <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
                        {product.seller && typeof product.seller === 'object' && product.seller.id ? (
                            <Pressable
                                onPress={() => {
                                    if (!product.seller.id) {
                                        Alert.alert('Hata', 'Satıcı bilgisi eksik.');
                                        return;
                                    }
                                    router.push({ pathname: '/seller/[id]', params: { id: product.seller.id } });
                                }}
                            >
                                <Text style={styles.sellerName}>{`${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() || product.seller.name}</Text>
                            </Pressable>
                        ) : (
                            <Text style={styles.sellerName}>{typeof product.seller === 'string' ? product.seller : (product.seller?.firstName || '') + ' ' + (product.seller?.lastName || '')}</Text>
                        )}
                    </View>

                    <View style={styles.locationInfo}>
                        <Ionicons name="location-outline" size={20} color={Colors.textSecondary} />
                        <Text style={styles.locationText}>{product.location || 'Konum bilgisi yok'}</Text>
                    </View>

                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionTitle}>Ürün Açıklaması</Text>
                        <Text style={styles.description}>{product.description || 'Açıklama yok.'}</Text>
                    </View>
                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: 24 }} />
                    {/* Ürün Değerlendirmeleri ve Yorumlar */}
                    {/* Başlık ve Tümü butonu */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, color: Colors.text }}>Ürün Değerlendirmeleri</Text>
                        <Pressable onPress={() => router.push(`/product/${id}/comments`)}>
                            <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Tümü {comments.length > 0 ? `(${comments.length})` : ''}</Text>
                        </Pressable>
                    </View>
                    {/* Ortalama puan ve yıldızlar */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 32, fontWeight: 'bold', color: Colors.primary }}>{averageRating || '-'}</Text>
                        <View style={{ flexDirection: 'row', marginLeft: 8 }}>{renderStars(Number(averageRating) || 0)}</View>
                        <Text style={{ marginLeft: 12, color: Colors.textSecondary }}>{comments.length} Yorum</Text>
                    </View>
                    {/* Yorum Kartları - Yatay Scroll */}
                    <View style={{ marginTop: 0 }}>
                        {commentsLoading ? (
                            <ActivityIndicator size="small" color={Colors.primary} />
                        ) : comments.length === 0 ? (
                            <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 16 }}>Henüz yorum yok.</Text>
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 8 }}>
                                {comments.slice(0, 6).map((c) => (
                                    <View key={c.id} style={{ width: 260, marginRight: 12, backgroundColor: Colors.background, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border, shadowColor: Colors.text, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1, alignItems: 'center' }}>
                                        {/* Kullanıcının verdiği yıldızlar */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 4, alignSelf: 'stretch' }}>
                                            {renderStars(Number(c.rating))}
                                        </View>
                                        {/* Kullanıcı adı ve tarih */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, justifyContent: 'flex-start', alignSelf: 'stretch' }}>
                                            <Ionicons name="person-circle-outline" size={22} color={Colors.textSecondary} />
                                            <Text style={{ marginLeft: 6, fontWeight: 'bold', color: Colors.text }}>{maskName(c.userName, c.firstName, c.lastName)}</Text>
                                            <Text style={{ marginLeft: 8, color: Colors.textSecondary, fontSize: 12 }}>{c.createdAt && c.createdAt.toDate ? c.createdAt.toDate().toLocaleDateString() : ''}</Text>
                                        </View>
                                        {/* Yorum metni */}
                                        <Text style={{ color: Colors.textSecondary, marginBottom: 8, textAlign: 'left', alignSelf: 'stretch' }}>{c.comment}</Text>
                                        {/* Alt etiket ve ikonlar */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, justifyContent: 'space-between', width: '100%' }}>
                                            <Text style={{ color: Colors.primary, fontSize: 12, fontWeight: 'bold', backgroundColor: Colors.primary + '10', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                                                Satıcıdan alındı
                                            </Text>
                                            <Pressable onPress={() => handleLike(c.id, c.likes || [])} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Animated.View style={{ transform: [{ scale: likeAnimations[c.id] || 1 }] }}>
                                                    <Ionicons name="thumbs-up-outline" size={16} color={(c.likes && user && c.likes.includes(user.id)) ? Colors.primary : Colors.textSecondary} style={{ marginRight: 4 }} />
                                                </Animated.View>
                                                <Text style={{ color: Colors.textSecondary, fontSize: 12, marginRight: 0 }}>{c.likes ? c.likes.length : 0}</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ))}
                                {comments.length > 6 && (
                                    <Pressable onPress={() => router.push(`/product/${id}/comments`)} style={{ justifyContent: 'center', alignItems: 'center', width: 120 }}>
                                        <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Tüm Yorumları Gör</Text>
                                    </Pressable>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Pressable
                    onPress={handleContactSeller}
                    style={[styles.contactButton, (!product || !product.seller || !product.seller.id || !product.id) && { opacity: 0.5 }]}
                    disabled={!product || !product.seller || !product.seller.id || !product.id}
                >
                    <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
                    <Text style={styles.contactButtonText}>Satıcı ile İletişime Geç</Text>
                </Pressable>
            </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        padding: 8,
    },
    shareButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    imageContainer: {
        padding: 16,
    },
    mainImage: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        backgroundColor: Colors.border,
    },
    thumbnailContainer: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 8,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    selectedThumbnail: {
        borderColor: Colors.primary,
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    price: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 16,
    },
    sellerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sellerName: {
        fontSize: 16,
        color: Colors.text,
        marginLeft: 8,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginLeft: 8,
    },
    stockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    stockText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginLeft: 8,
    },
    descriptionContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: Colors.background,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    contactButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
        marginLeft: 8,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    errorText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
}); 