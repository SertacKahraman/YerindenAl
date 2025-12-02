import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, arrayRemove, arrayUnion, collection, doc, doc as firestoreDoc, getDoc, getDocs, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import WebFooter from '../../components/web/WebFooter';
import WebLayout from '../../components/web/WebLayout';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function ProductDetailScreenWeb() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { width } = useWindowDimensions();
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
    const likeAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

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
            alert('Yorum eklemek için giriş yapmalısınız.');
            return;
        }
        if (!commentText.trim()) {
            alert('Yorum metni boş olamaz.');
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
            alert('Yorumunuz eklendi!');
        } catch (e) {
            alert('Yorum eklenirken bir hata oluştu.');
        }
        setSubmitting(false);
    };

    const handleLike = async (commentId: string, likes: string[] = []) => {
        if (!user) {
            alert('Beğenmek için giriş yapmalısınız.');
            return;
        }
        if (likeAnimations[commentId]) {
            Animated.sequence([
                Animated.timing(likeAnimations[commentId], { toValue: 1.4, duration: 120, useNativeDriver: true }),
                Animated.timing(likeAnimations[commentId], { toValue: 1, duration: 120, useNativeDriver: true })
            ]).start();
        }
        const commentRef = firestoreDoc(db, 'comments', commentId);
        try {
            if (likes.includes(user.id)) {
                await updateDoc(commentRef, { likes: arrayRemove(user.id) });
            } else {
                await updateDoc(commentRef, { likes: arrayUnion(user.id) });
            }
            const q = query(collection(db, 'comments'), where('productId', '==', String(id)), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            const items: any[] = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            setComments(items);
        } catch (e) {
            console.error(e);
        }
    };

    const handleToggleFavorite = async () => {
        if (!user) {
            alert('Favorilere eklemek için giriş yapmalısınız.');
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
            alert('Favori işlemi sırasında bir hata oluştu.');
        }
    };

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
            alert('Sohbet başlatmak için giriş yapmalısınız.');
            return;
        }
        if (isOwnListing) {
            alert('Kendi ilanınıza mesaj atamazsınız.');
            return;
        }
        if (!product || !product.seller || !product.seller.id || !product.id) {
            alert('Satıcı veya ürün bilgisi eksik.');
            return;
        }
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('users', 'array-contains', user.id));
        const querySnapshot = await getDocs(q);
        let foundChatId = null;
        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.users.includes(product.seller.id) && (data.productId ? data.productId === product.id : true)) {
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
            <WebLayout>
                <View style={{ height: 500, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </WebLayout>
        );
    }

    if (!product) {
        return (
            <WebLayout>
                <View style={{ height: 500, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, color: Colors.textSecondary }}>Ürün bulunamadı</Text>
                </View>
            </WebLayout>
        );
    }

    const images = product.images && Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image];
    const isOwnListing = user && product.seller && (typeof product.seller === 'object' ? product.seller.id === user.id : false);

    return (
        <WebLayout showFooter={false}>
            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.content}>
                    <View style={styles.breadcrumb}>
                        <Text style={styles.breadcrumbText} onPress={() => router.push('/')}>Ana Sayfa</Text>
                        <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
                        <Text style={styles.breadcrumbText}>{product.category || 'Ürünler'}</Text>
                        <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
                        <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>{product.title}</Text>
                    </View>

                    <View style={styles.mainGrid}>
                        {/* Left Column: Images */}
                        <View style={styles.imageColumn}>
                            <View style={styles.mainImageWrapper}>
                                <Image source={{ uri: images[selectedImageIndex] }} style={styles.mainImage} resizeMode="cover" />
                                <Pressable style={styles.favoriteButton} onPress={handleToggleFavorite}>
                                    <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={28} color={Colors.primary} />
                                </Pressable>
                            </View>
                            <View style={styles.thumbnailGrid}>
                                {images.map((image: any, index: any) => (
                                    <Pressable
                                        key={index}
                                        style={[styles.thumbnail, selectedImageIndex === index && styles.selectedThumbnail]}
                                        onPress={() => setSelectedImageIndex(index)}
                                    >
                                        <Image source={{ uri: image }} style={styles.thumbnailImage} />
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Right Column: Details */}
                        <View style={styles.detailsColumn}>
                            <Text style={styles.title}>{product.title}</Text>

                            <View style={styles.ratingRow}>
                                <View style={{ flexDirection: 'row' }}>{renderStars(Number(averageRating) || 0)}</View>
                                <Text style={styles.ratingText}>{averageRating ? `${averageRating} (${comments.length} Değerlendirme)` : 'Henüz değerlendirilmemiş'}</Text>
                            </View>

                            <Text style={styles.price}>{product.price} TL <Text style={styles.unit}>/ {product.unit}</Text></Text>

                            <View style={styles.sellerCard}>
                                <View style={styles.sellerHeader}>
                                    <Ionicons name="storefront-outline" size={24} color={Colors.primary} />
                                    <View>
                                        <Text style={styles.sellerLabel}>Satıcı</Text>
                                        <Pressable onPress={() => product.seller?.id && router.push({ pathname: '/seller/[id]', params: { id: product.seller.id } })}>
                                            <Text style={styles.sellerName}>{product.seller?.name || 'Bilinmeyen Satıcı'}</Text>
                                        </Pressable>
                                    </View>
                                </View>
                                {isOwnListing ? (
                                    <View style={styles.ownListingBadge}>
                                        <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                                        <Text style={styles.ownListingText}>Sizin İlanınız</Text>
                                    </View>
                                ) : (
                                    <Pressable style={styles.contactButton} onPress={handleContactSeller}>
                                        <Ionicons name="chatbubble-outline" size={20} color={Colors.white} />
                                        <Text style={styles.contactButtonText}>Satıcıyla İletişime Geç</Text>
                                    </Pressable>
                                )}
                            </View>

                            <View style={styles.specsContainer}>
                                <Text style={styles.sectionTitle}>Ürün Özellikleri</Text>
                                <View style={styles.specsGrid}>
                                    <View style={styles.specItem}>
                                        <Text style={styles.specLabel}>Konum</Text>
                                        <Text style={styles.specValue}>{product.location || '-'}</Text>
                                    </View>
                                    {product.mainCategory && (
                                        <View style={styles.specItem}>
                                            <Text style={styles.specLabel}>Kategori</Text>
                                            <Text style={styles.specValue}>{product.breed || product.type || product.subCategory || product.mainCategory}</Text>
                                        </View>
                                    )}
                                    {product.organicCertified !== undefined && (
                                        <View style={styles.specItem}>
                                            <Text style={styles.specLabel}>Organik</Text>
                                            <Text style={[styles.specValue, { color: product.organicCertified ? Colors.primary : Colors.textSecondary }]}>
                                                {product.organicCertified ? 'Evet' : 'Hayır'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <View style={styles.descriptionContainer}>
                                <Text style={styles.sectionTitle}>Açıklama</Text>
                                <Text style={styles.description}>{product.description || 'Açıklama bulunmuyor.'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Comments Section */}
                    <View style={styles.commentsSection}>
                        <Text style={styles.sectionTitle}>Değerlendirmeler ({comments.length})</Text>
                        <View style={styles.commentsGrid}>
                            {comments.map((c) => (
                                <View key={c.id} style={styles.commentCard}>
                                    <View style={styles.commentHeader}>
                                        <View style={styles.commentUser}>
                                            <View style={styles.avatarPlaceholder}>
                                                <Text style={styles.avatarText}>{c.userName?.[0] || 'U'}</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.commentUserName}>{maskName(c.userName, c.firstName, c.lastName)}</Text>
                                                <View style={{ flexDirection: 'row' }}>{renderStars(Number(c.rating))}</View>
                                            </View>
                                        </View>
                                        <Text style={styles.commentDate}>{c.createdAt?.toDate?.().toLocaleDateString()}</Text>
                                    </View>
                                    <Text style={styles.commentText}>{c.comment}</Text>
                                    <Pressable style={styles.likeButton} onPress={() => handleLike(c.id, c.likes || [])}>
                                        <Ionicons name="thumbs-up-outline" size={16} color={(c.likes && user && c.likes.includes(user.id)) ? Colors.primary : Colors.textSecondary} />
                                        <Text style={styles.likeCount}>{c.likes ? c.likes.length : 0}</Text>
                                    </Pressable>
                                </View>
                            ))}
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
        maxWidth: 1200,
        width: '100%',
        marginHorizontal: 'auto',
        padding: 24,
    },
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    breadcrumbText: {
        color: Colors.textSecondary,
        fontSize: 14,
        cursor: 'pointer',
    },
    breadcrumbActive: {
        color: Colors.text,
        fontWeight: '600',
    },
    mainGrid: {
        flexDirection: 'row',
        gap: 40,
        flexWrap: 'wrap',
    },
    imageColumn: {
        flex: 1,
        minWidth: 400,
        maxWidth: 600,
    },
    detailsColumn: {
        flex: 1,
        minWidth: 400,
    },
    mainImageWrapper: {
        position: 'relative',
        width: '100%',
        aspectRatio: 4 / 3,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    favoriteButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 10,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    thumbnailGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden',
        cursor: 'pointer',
    },
    selectedThumbnail: {
        borderColor: Colors.primary,
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    ratingText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    price: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 32,
    },
    unit: {
        fontSize: 18,
        color: Colors.textSecondary,
        fontWeight: 'normal',
    },
    sellerCard: {
        backgroundColor: Colors.background,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 32,
    },
    sellerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sellerLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        cursor: 'pointer',
    },
    contactButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    contactButtonText: {
        color: Colors.white,
        fontWeight: '600',
    },
    ownListingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: Colors.primary + '15',
        borderRadius: 8,
        gap: 8,
    },
    ownListingText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    specsContainer: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
    },
    specsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    specItem: {
        minWidth: 120,
    },
    specLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    specValue: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
    },
    descriptionContainer: {
        marginBottom: 32,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: Colors.textSecondary,
    },
    commentsSection: {
        marginTop: 40,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: 40,
    },
    commentsGrid: {
        gap: 16,
    },
    commentCard: {
        backgroundColor: Colors.white,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    commentUser: {
        flexDirection: 'row',
        gap: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 18,
    },
    commentUserName: {
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 2,
    },
    commentDate: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    commentText: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
        marginBottom: 12,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
    },
    likeCount: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
});
