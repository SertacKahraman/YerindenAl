import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import WebLayout from '../components/web/WebLayout';
import { Colors } from '../constants/Colors';

export default function NotFoundScreenWeb() {
    return (
        <WebLayout>
            <Stack.Screen options={{ title: 'Sayfa Bulunamadı' }} />
            <View style={styles.container}>
                <Text style={styles.title}>404</Text>
                <Text style={styles.subtitle}>Aradığınız sayfa bulunamadı.</Text>
                <Link href="/" style={styles.link}>
                    <Text style={styles.linkText}>Ana Sayfaya Dön</Text>
                </Link>
            </View>
        </WebLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        minHeight: 400,
    },
    title: {
        fontSize: 72,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: Colors.textSecondary,
        marginBottom: 32,
    },
    link: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: Colors.primary,
        borderRadius: 8,
    },
    linkText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
