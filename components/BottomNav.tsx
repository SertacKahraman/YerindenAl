import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();
    const { bottom } = useSafeAreaInsets();
    const { user } = useAuth();

    const isActive = (path: string) => pathname === path;

    return (
        <View style={[styles.container, { height: 55 + bottom }]}>
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
                        router.push('/create-listing');
                    }}
                >
                    <View style={styles.addButtonInner}>
                        <Ionicons name="add" size={32} color={Colors.white} />
                    </View>
                    <Text style={styles.addButtonText}>İlan Ver</Text>
                </Pressable>

                <Pressable
                    style={styles.navItem}
                    onPress={() => {
                        if (user) {
                            router.push('/profile');
                        } else {
                            router.push('/auth');
                        }
                    }}
                >
                    <Ionicons
                        name={isActive('/profile') ? "person" : "person-outline"}
                        size={24}
                        color={isActive('/profile') ? Colors.primary : Colors.textSecondary}
                    />
                    <Text style={[styles.navText, isActive('/profile') && styles.activeText]}>
                        Profil
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 0,
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
        flex: 1,
        paddingHorizontal: 20,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 6,
    },
    navText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    activeText: {
        color: Colors.primary,
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