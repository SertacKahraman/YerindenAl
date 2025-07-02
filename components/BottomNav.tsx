import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useCart } from '../context/CartContext';

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();
    const { items } = useCart();
    const { bottom } = useSafeAreaInsets();

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);

    const isActive = (path: string) => pathname === path;

    return (
        <View style={[styles.container, { height: 70 + bottom, paddingBottom: 10 + bottom }]}>
            <View style={styles.navContent}>
                <Pressable
                    style={styles.navItem}
                    onPress={() => router.push('/')}
                >
                    <Ionicons
                        name={isActive('/') ? "home" : "home-outline"}
                        size={24}
                        color={isActive('/') ? Colors.primary : Colors.textSecondary}
                    />
                    <Text style={[styles.navText, isActive('/') && styles.activeText]}>
                        Anasayfa
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.addButton}
                    onPress={() => {
                        // İlan verme sayfasına yönlendirme
                    }}
                >
                    <View style={styles.addButtonInner}>
                        <Ionicons name="add" size={32} color={Colors.white} />
                    </View>
                    <Text style={styles.addButtonText}>İlan Ver</Text>
                </Pressable>

                <Pressable
                    style={styles.navItem}
                    onPress={() => router.push('/cart')}
                >
                    <View style={styles.cartContainer}>
                        <Ionicons
                            name={isActive('/cart') ? "cart" : "cart-outline"}
                            size={24}
                            color={isActive('/cart') ? Colors.primary : Colors.textSecondary}
                        />
                        {itemCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{itemCount}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.navText, isActive('/cart') && styles.activeText]}>
                        Sepet
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    navContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        paddingHorizontal: 20,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    navText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    activeText: {
        color: Colors.primary,
    },
    cartContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    addButton: {
        alignItems: 'center',
        marginTop: -20,
        marginHorizontal: 20,
    },
    addButtonInner: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    addButtonText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    },
}); 