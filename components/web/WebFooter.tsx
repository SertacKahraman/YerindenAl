import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function WebFooter() {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.topSection}>
                    <View style={styles.column}>
                        <Text style={styles.logoText}>YerindenAl</Text>
                        <Text style={styles.description}>
                            Yerel üreticiden doğrudan sofranıza. Taze, doğal ve güvenilir gıdanın adresi.
                        </Text>
                        <View style={styles.socials}>
                            <Pressable style={styles.socialIcon}><Ionicons name="logo-instagram" size={20} color={Colors.textSecondary} /></Pressable>
                            <Pressable style={styles.socialIcon}><Ionicons name="logo-twitter" size={20} color={Colors.textSecondary} /></Pressable>
                            <Pressable style={styles.socialIcon}><Ionicons name="logo-facebook" size={20} color={Colors.textSecondary} /></Pressable>
                        </View>
                    </View>

                    <View style={styles.column}>
                        <Text style={styles.title}>Kurumsal</Text>
                        <Pressable><Text style={styles.link}>Hakkımızda</Text></Pressable>
                        <Pressable><Text style={styles.link}>Kariyer</Text></Pressable>
                        <Pressable><Text style={styles.link}>İletişim</Text></Pressable>
                        <Pressable><Text style={styles.link}>Blog</Text></Pressable>
                    </View>

                    <View style={styles.column}>
                        <Text style={styles.title}>Yardım</Text>
                        <Pressable><Text style={styles.link}>Sıkça Sorulan Sorular</Text></Pressable>
                        <Pressable><Text style={styles.link}>Kargo ve Teslimat</Text></Pressable>
                        <Pressable><Text style={styles.link}>İade Koşulları</Text></Pressable>
                        <Pressable><Text style={styles.link}>Güvenlik</Text></Pressable>
                    </View>

                    <View style={styles.column}>
                        <Text style={styles.title}>Kategoriler</Text>
                        <Pressable><Text style={styles.link}>Süt ve Süt Ürünleri</Text></Pressable>
                        <Pressable><Text style={styles.link}>Meyve & Sebze</Text></Pressable>
                        <Pressable><Text style={styles.link}>Et ve Et Ürünleri</Text></Pressable>
                        <Pressable><Text style={styles.link}>Bal ve Reçel</Text></Pressable>
                    </View>
                </View>

                <View style={styles.bottomSection}>
                    <Text style={styles.copyright}>© 2024 YerindenAl. Tüm hakları saklıdır.</Text>
                    <View style={styles.legalLinks}>
                        <Pressable><Text style={styles.legalLink}>Kullanım Koşulları</Text></Pressable>
                        <Pressable><Text style={styles.legalLink}>Gizlilik Politikası</Text></Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingVertical: 60,
        marginTop: 60,
    },
    content: {
        maxWidth: 1200,
        width: '100%',
        marginHorizontal: 'auto',
        paddingHorizontal: 24,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 40,
        marginBottom: 60,
    },
    column: {
        flex: 1,
        minWidth: 200,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
        marginBottom: 24,
    },
    socials: {
        flexDirection: 'row',
        gap: 12,
    },
    socialIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 20,
    },
    link: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 12,
    },
    bottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    copyright: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    legalLinks: {
        flexDirection: 'row',
        gap: 24,
    },
    legalLink: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
});
