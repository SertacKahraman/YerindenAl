import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function WebNavbar() {
    const router = useRouter();
    const { query } = useLocalSearchParams();
    const { user, signOut } = useAuth();
    const { items } = useCart();
    const [searchQuery, setSearchQuery] = useState(query ? String(query) : '');
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push({ pathname: '/search-results', params: { query: searchQuery } });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Logo */}
                <Pressable onPress={() => router.push('/')} style={styles.logoContainer}>
                    <Text style={styles.logoText}>YerindenAl</Text>
                </Pressable>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Ürün, kategori veya satıcı ara..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                    <Pressable style={styles.searchButton} onPress={handleSearch}>
                        <Ionicons name="search" size={20} color={Colors.white} />
                    </Pressable>
                </View>

                {/* Right Actions */}
                <View style={styles.actions}>
                    <Pressable style={styles.actionButton} onPress={() => router.push('/create-listing')}>
                        <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
                        <Text style={styles.actionText}>İlan Ver</Text>
                    </Pressable>

                    <Pressable style={styles.actionButton} onPress={() => router.push('/cart')}>
                        <View>
                            <Ionicons name="cart-outline" size={24} color={Colors.text} />
                            {items.length > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{items.length}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.actionText}>Sepetim</Text>
                    </Pressable>

                    {user ? (
                        <View style={{ position: 'relative' }}>
                            <Pressable
                                style={styles.userButton}
                                onPress={() => setShowUserMenu(!showUserMenu)}
                            >
                                <Image
                                    source={{ uri: user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User') }}
                                    style={styles.avatar}
                                />
                                <Text style={styles.userName}>{user.name?.split(' ')[0]}</Text>
                                <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                            </Pressable>

                            {showUserMenu && (
                                <View style={styles.dropdown}>
                                    <Pressable style={styles.dropdownItem} onPress={() => { setShowUserMenu(false); router.push('/profile'); }}>
                                        <Ionicons name="person-outline" size={20} color={Colors.text} />
                                        <Text style={styles.dropdownText}>Profilim</Text>
                                    </Pressable>
                                    <Pressable style={styles.dropdownItem} onPress={() => { setShowUserMenu(false); router.push('/messages'); }}>
                                        <Ionicons name="chatbubble-outline" size={20} color={Colors.text} />
                                        <Text style={styles.dropdownText}>Mesajlar</Text>
                                    </Pressable>
                                    <View style={styles.divider} />
                                    <Pressable style={styles.dropdownItem} onPress={() => { setShowUserMenu(false); signOut(); }}>
                                        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                                        <Text style={[styles.dropdownText, { color: Colors.error }]}>Çıkış Yap</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    ) : (
                        <Pressable style={styles.loginButton} onPress={() => router.push('/auth')}>
                            <Ionicons name="person-circle-outline" size={24} color={Colors.white} />
                            <Text style={styles.loginButtonText}>Giriş Yap</Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        height: 80,
        justifyContent: 'center',
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
    },
    content: {
        maxWidth: 1200,
        width: '100%',
        marginHorizontal: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
    },
    logoContainer: {
        marginRight: 40,
    },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.primary,
        letterSpacing: -0.5,
    },
    searchContainer: {
        flex: 1,
        maxWidth: 600,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingLeft: 16,
        overflow: 'hidden',
    },
    searchInput: {
        flex: 1,
        height: 44,
        fontSize: 16,
        outlineStyle: 'none',
    },
    searchButton: {
        backgroundColor: Colors.primary,
        height: 44,
        width: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        marginLeft: 24,
    },
    actionButton: {
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 12,
        color: Colors.text,
        fontWeight: '500',
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    userButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 4,
        borderRadius: 8,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.border,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    dropdown: {
        position: 'absolute',
        top: '120%',
        right: 0,
        width: 200,
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 8,
    },
    dropdownText: {
        fontSize: 14,
        color: Colors.text,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 4,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    loginButtonText: {
        color: Colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
});
