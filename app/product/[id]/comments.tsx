import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../config/firebase';
import { Colors } from '../../../constants/Colors';

export default function ProductCommentsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchComments() {
            if (!id) return;
            setLoading(true);
            const q = query(collection(db, 'comments'), where('productId', '==', String(id)), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            const items: any[] = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            setComments(items);
            setLoading(false);
        }
        fetchComments();
    }, [id]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Tüm Yorumlar</Text>
            </View>
            <ScrollView style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color={Colors.primary} />
                ) : comments.length === 0 ? (
                    <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 32 }}>Henüz yorum yok.</Text>
                ) : (
                    comments.map((c) => (
                        <View key={c.id} style={styles.commentBox}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <Ionicons name="person-circle-outline" size={20} color={Colors.textSecondary} />
                                <Text style={{ marginLeft: 6, fontWeight: 'bold', color: Colors.text }}>{c.userName}</Text>
                            </View>
                            <Text style={{ color: Colors.textSecondary }}>{c.comment}</Text>
                            <Text style={{ color: Colors.textSecondary, fontSize: 12, marginTop: 4 }}>{c.createdAt && c.createdAt.toDate ? c.createdAt.toDate().toLocaleString() : ''}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
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
        padding: 16,
    },
    commentBox: {
        marginBottom: 16,
        backgroundColor: Colors.white,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
}); 