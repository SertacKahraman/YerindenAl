import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import WebFooter from '../../components/web/WebFooter';
import WebLayout from '../../components/web/WebLayout';
import { storage } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreenWeb() {
    const { user, signOut, updateProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user && !loading) {
            router.push('/');
        }
    }, [user, loading]);

    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Profil fotoğrafı eklemek için galeri erişim izni vermelisiniz.');
            return;
        }
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
            await updateProfile({ photoURL: downloadURL });
            alert('Profil fotoğrafınız güncellendi!');
        }
    };

    const menuItems = [
        { icon: 'create-outline', text: 'Profili Düzenle', action: () => { } },
        { icon: 'list-outline', text: 'Siparişlerim', action: () => { } },
        { icon: 'heart-outline', text: 'Favorilerim', action: () => router.push('./profile/favorites') },
        { icon: 'chatbubble-ellipses-outline', text: 'Mesajlar', action: () => router.push('/messages') },
        { icon: 'settings-outline', text: 'Ayarlar', action: () => { } },
        { icon: 'help-circle-outline', text: 'Yardım', action: () => { } }
    ];

    if (!user) return null;

    return (
        <WebLayout showFooter={false}>
            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.content}>
                    <View style={styles.card}>
                        <View style={styles.profileHeader}>
                            <Pressable onPress={handlePickImage} style={styles.imageWrapper}>
                                {user.photoURL ? (
                                    <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
                                ) : (
                                    <View style={styles.placeholderImage}>
                                        <Ionicons name="person" size={60} color={Colors.textSecondary} />
                                    </View>
                                )}
                                <View style={styles.editBadge}>
                                    <Ionicons name="camera" size={16} color={Colors.white} />
                                </View>
                            </Pressable>

                            <View style={styles.headerInfo}>
                                <Text style={styles.name}>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name}</Text>
                                <Text style={styles.email}>{user.email}</Text>
                            </View>
                        </View>

                        <View style={styles.menuGrid}>
                            {menuItems.map((item, index) => (
                                <Pressable key={index} style={styles.menuItem} onPress={item.action}>
                                    <View style={styles.iconBox}>
                                        <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.menuText}>{item.text}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.border} />
                                </Pressable>
                            ))}
                        </View>

                        <Pressable style={styles.signOutButton} onPress={() => signOut()}>
                            <Text style={styles.signOutText}>Çıkış Yap</Text>
                        </Pressable>
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
        maxWidth: 800,
        width: '100%',
        marginHorizontal: 'auto',
        padding: 40,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 40,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        marginBottom: 40,
        paddingBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    imageWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: Colors.white,
    },
    headerInfo: {
        flex: 1,
    },
    name: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    email: {
        fontSize: 18,
        color: Colors.textSecondary,
    },
    menuGrid: {
        gap: 16,
        marginBottom: 40,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors.background,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'transparent',
        gap: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuText: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: Colors.text,
    },
    signOutButton: {
        backgroundColor: '#FFF0F0',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    signOutText: {
        color: Colors.error,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
