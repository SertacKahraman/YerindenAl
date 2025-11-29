import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import WebFooter from '../../components/web/WebFooter';
import WebLayout from '../../components/web/WebLayout';
import { Colors } from '../../constants/Colors';
import { useCart } from '../../context/CartContext';

export default function CartScreenWeb() {
    const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
    const router = useRouter();

    if (items.length === 0) {
        return (
            <WebLayout showFooter={false}>
                <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={100} color={Colors.primary} />
                        <Text style={styles.emptyText}>Sepetiniz boş</Text>
                        <Text style={styles.emptySubText}>Henüz sepetinize ürün eklemediniz.</Text>
                        <Pressable style={styles.continueButton} onPress={() => router.push('/')}>
                            <Text style={styles.buttonText}>Alışverişe Başla</Text>
                        </Pressable>
                    </View>
                    <WebFooter />
                </ScrollView>
            </WebLayout>
        );
    }

    return (
        <WebLayout showFooter={false}>
            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.content}>
                    <Text style={styles.pageTitle}>Sepetim ({items.length} Ürün)</Text>

                    <View style={styles.grid}>
                        {/* Left Column: Cart Items */}
                        <View style={styles.itemsColumn}>
                            {items.map(item => (
                                <View key={item.id} style={styles.cartItem}>
                                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemTitle}>{item.title}</Text>
                                        <Text style={styles.itemPrice}>{item.price.toLocaleString('tr-TR')} ₺</Text>
                                    </View>

                                    <View style={styles.quantityControl}>
                                        <Pressable
                                            style={styles.qtyBtn}
                                            onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Ionicons name="remove" size={16} color={Colors.text} />
                                        </Pressable>
                                        <Text style={styles.qtyText}>{item.quantity}</Text>
                                        <Pressable
                                            style={styles.qtyBtn}
                                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Ionicons name="add" size={16} color={Colors.text} />
                                        </Pressable>
                                    </View>

                                    <Text style={styles.itemTotal}>
                                        {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                                    </Text>

                                    <Pressable
                                        style={styles.removeBtn}
                                        onPress={() => removeFromCart(item.id)}
                                    >
                                        <Ionicons name="trash-outline" size={20} color={Colors.error} />
                                    </Pressable>
                                </View>
                            ))}

                            <Pressable style={styles.clearCartBtn} onPress={clearCart}>
                                <Ionicons name="trash-outline" size={18} color={Colors.textSecondary} />
                                <Text style={styles.clearCartText}>Sepeti Temizle</Text>
                            </Pressable>
                        </View>

                        {/* Right Column: Summary */}
                        <View style={styles.summaryColumn}>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>Sipariş Özeti</Text>

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Ara Toplam</Text>
                                    <Text style={styles.summaryValue}>{total.toLocaleString('tr-TR')} ₺</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Kargo</Text>
                                    <Text style={styles.summaryValue}>Bedava</Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Toplam</Text>
                                    <Text style={styles.totalValue}>{total.toLocaleString('tr-TR')} ₺</Text>
                                </View>

                                <Pressable style={styles.checkoutButton}>
                                    <Text style={styles.checkoutButtonText}>Ödemeye Geç</Text>
                                    <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                                </Pressable>

                                <Pressable style={styles.continueShoppingBtn} onPress={() => router.push('/')}>
                                    <Text style={styles.continueShoppingText}>Alışverişe Devam Et</Text>
                                </Pressable>
                            </View>
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
        padding: 40,
        flex: 1,
    },
    emptyContainer: {
        height: 600,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
    },
    emptySubText: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    continueButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 8,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 32,
    },
    grid: {
        flexDirection: 'row',
        gap: 40,
        flexWrap: 'wrap',
    },
    itemsColumn: {
        flex: 2,
        minWidth: 600,
    },
    summaryColumn: {
        flex: 1,
        minWidth: 300,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 24,
    },
    itemImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    itemPrice: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
    },
    qtyBtn: {
        padding: 8,
        width: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        width: 40,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    itemTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        width: 120,
        textAlign: 'right',
    },
    removeBtn: {
        padding: 8,
    },
    clearCartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        alignSelf: 'flex-start',
    },
    clearCartText: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    summaryCard: {
        backgroundColor: Colors.white,
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    summaryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 24,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    summaryLabel: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    summaryValue: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    checkoutButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        gap: 8,
        marginBottom: 16,
    },
    checkoutButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    continueShoppingBtn: {
        alignItems: 'center',
        padding: 12,
    },
    continueShoppingText: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
});
