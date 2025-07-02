import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { collection, doc as firestoreDoc, getDocs, getDoc as getFirestoreDoc, query, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { db, storage } from '../config/firebase';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
    // Tüm hook'lar koşulsuz ve en başta
    const { user, signOut, updateProfile, loading } = useAuth();
    const router = useRouter();
    const [showFavorites, setShowFavorites] = useState(false);
    const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
    const [loadingFavorites, setLoadingFavorites] = useState(false);



    // Kullanıcı yoksa yönlendirme (push ile)
    useEffect(() => {
        if (!user && !loading) {
            setTimeout(() => {
                router.push('/');
            }, 0);
        }
    }, [user, loading]);

    // Çıkış işlemi sonrası yönlendirme
    const handleSignOut = async () => {
        await signOut();
        setTimeout(() => {
            router.push('/');
        }, 0);
    };

    const handlePickImage = async () => {
        // İzin iste
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('İzin Gerekli', 'Profil fotoğrafı eklemek için galeri erişim izni vermelisiniz.');
            return;
        }
        // Fotoğraf seç
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled && result.assets && result.assets.length > 0 && user) {
            const asset = result.assets[0];
            const response = await fetch(asset.uri);
            const blob = await response.blob();
            const ext = asset.uri.split('.').pop();
            const storageRef = ref(storage, `profile-images/${user.id}.${ext}`);
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);
            // Firestore ve Auth profilini güncelle
            await updateProfile({ photoURL: downloadURL });
            Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi!');
        }
    };

    // Favori ürünleri çek
    useEffect(() => {
        async function fetchFavorites() {
            if (!user || !showFavorites) return;
            setLoadingFavorites(true);
            const userRef = firestoreDoc(db, 'users', user.id);
            const userSnap = await getFirestoreDoc(userRef);
            const favIds = userSnap.exists() && userSnap.data().favorites ? userSnap.data().favorites : [];
            if (favIds.length === 0) {
                setFavoriteProducts([]);
                setLoadingFavorites(false);
                return;
            }
            // Firestore'dan favori ürünleri topluca çek
            const q = query(collection(db, 'products'), where('__name__', 'in', favIds.slice(0, 10)));
            const snap = await getDocs(q);
            const items: any[] = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            setFavoriteProducts(items);
            setLoadingFavorites(false);
        }
        fetchFavorites();
    }, [user, showFavorites]);

    const menuItems = [
        { icon: 'create-outline', text: 'Profili Düzenle', action: () => { } },
        { icon: 'list-outline', text: 'Siparişlerim', action: () => { } },
        { icon: 'heart-outline', text: 'Favorilerim', action: () => router.push('./profile/favorites') },
        { icon: 'settings-outline', text: 'Ayarlar', action: () => { } },
        { icon: 'help-circle-outline', text: 'Yardım', action: () => { } }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Profil</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.profileInfo}>
                    <Pressable onPress={handlePickImage} style={styles.profileImageWrapper}>
                        {user?.photoURL ? (
                            <Image
                                source={{ uri: user.photoURL }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <Ionicons name="person-circle-outline" size={100} color={Colors.border} />
                        )}
                        <View style={styles.editIconWrapper}>
                            <Ionicons name="camera" size={24} color={Colors.primary} />
                        </View>
                    </Pressable>
                    <Text style={styles.profileName}>{user?.name || 'Kullanıcı'}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                </View>

                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <Pressable key={index} style={styles.menuItem} onPress={item.action}>
                            <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
                            <Text style={styles.menuItemText}>{item.text}</Text>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                        </Pressable>
                    ))}
                </View>
                <Pressable style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutButtonText}>Çıkış Yap</Text>
                </Pressable>
            </ScrollView>
            <BottomNav />
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
    },
    profileInfo: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    profileImageWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.border,
    },
    editIconWrapper: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.text,
    },
    profileEmail: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    menuContainer: {
        marginTop: 16,
        marginHorizontal: 16,
        backgroundColor: Colors.white,
        borderRadius: 12,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuItemText: {
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
        color: Colors.text,
    },
    signOutButton: {
        margin: 16,
        padding: 16,
        borderRadius: 12,
        backgroundColor: Colors.primary + '20',
        alignItems: 'center',
    },
    signOutButtonText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '600',
    }
}); 