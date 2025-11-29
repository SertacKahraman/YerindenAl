import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { Colors } from '../constants/Colors';
import { useCart } from '../context/CartContext';

export default function CartScreen() {
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';
    const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
    const router = useRouter();

    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.content, isWeb && { maxWidth: 1200, width: '100%', marginHorizontal: 'auto' }]}>
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={64} color={Colors.primary} />
                        <Text style={styles.emptyText}>Sepetiniz boş</Text>
                        <Pressable style={styles.continueButton} onPress={() => router.push('/')}>
                            <Text style={styles.buttonText}>Alışverişe Devam Et</Text>
                        </Pressable>
                    </View>
                </View>
                <BottomNav />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.content, isWeb && { maxWidth: 1200, width: '100%', marginHorizontal: 'auto' }]}>
                <Text style={styles.title}>Sepetim</Text>
                <View style={styles.itemsContainer}>
                    {items.map(item => (
                        <View key={item.id} style={styles.cartItem}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} />
                            <View style={styles.itemDetails}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.itemPrice}>{item.price.toLocaleString('tr-TR')} ₺</Text>
                                <View style={styles.quantityContainer}>
                                    <Pressable
                                        style={styles.quantityButton}
                                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                    >
                                        <Ionicons name="remove" size={16} color={Colors.primary} />
                                    </Pressable>
                                    <Text style={styles.quantity}>{item.quantity}</Text>
                                    <Pressable
                                        style={styles.quantityButton}
                                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                    >
                                        <Ionicons name="add" size={16} color={Colors.primary} />
                                    </Pressable>
                                </View>
                            </View>
                            <Pressable
                                style={styles.removeButton}
                                onPress={() => removeFromCart(item.id)}
                            >
                                <Ionicons name="trash-outline" size={20} color={Colors.error} />
                            </Pressable>
                        </View>
                    ))}
                </View>
                <View style={styles.summary}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Toplam:</Text>
                        <Text style={styles.totalValue}>{total.toLocaleString('tr-TR')} ₺</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Pressable style={styles.clearButton} onPress={clearCart}>
                            <Ionicons name="trash-outline" size={20} color={Colors.white} style={styles.buttonIcon} />
                            <Text style={styles.clearButtonText}>Sepeti Temizle</Text>
                        </Pressable>
                        <Pressable style={styles.checkoutButton}>
                            <Ionicons name="card-outline" size={20} color={Colors.white} style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Ödemeye Geç</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
            <BottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 24,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 18,
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    itemsContainer: {
        gap: 16,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    itemDetails: {
        flex: 1,
        gap: 8,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
    },
    itemPrice: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    quantityButton: {
        backgroundColor: Colors.surface,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    quantity: {
        fontSize: 16,
        minWidth: 24,
        textAlign: 'center',
        color: Colors.text,
    },
    removeButton: {
        padding: 8,
    },
    summary: {
        marginTop: 24,
        padding: 20,
        backgroundColor: Colors.white,
        borderRadius: 12,
        gap: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    totalLabel: {
        fontSize: 18,
        color: Colors.text,
        fontWeight: '500',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    clearButton: {
        flex: 1,
        flexDirection: 'row',
        padding: 16,
        backgroundColor: Colors.error,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    clearButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkoutButton: {
        flex: 2,
        flexDirection: 'row',
        padding: 16,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonIcon: {
        marginRight: 4,
    },
    continueButton: {
        padding: 16,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        alignItems: 'center',
        minWidth: 200,
    },
}); 