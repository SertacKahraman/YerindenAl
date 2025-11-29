import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import WebFooter from '../components/web/WebFooter';
import WebLayout from '../components/web/WebLayout';
import { db } from '../config/firebase';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

export default function MessagesScreenWeb() {
    const { user } = useAuth();
    const router = useRouter();
    const [chats, setChats] = useState<any[]>([]);
    const [userNames, setUserNames] = useState<{ [chatId: string]: string }>({});
    const [userAvatars, setUserAvatars] = useState<{ [chatId: string]: string | undefined }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const q = query(
            collection(db, 'chats'),
            where('users', 'array-contains', user.id)
        );
        const unsubscribe = onSnapshot(q, async (snap) => {
            const items: any[] = [];
            const names: { [chatId: string]: string } = {};
            const avatars: { [chatId: string]: string | undefined } = {};

            for (const docSnap of snap.docs) {
                const data = docSnap.data();
                items.push({ id: docSnap.id, ...data });
                const otherUserId = (data.users || []).find((uid: string) => uid !== user.id);
                if (otherUserId) {
                    const userDoc = await getDoc(doc(db, 'users', otherUserId));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        names[docSnap.id] = ((userData.firstName || '') + ' ' + (userData.lastName || '')).trim() || userData.name || userData.email;
                        avatars[docSnap.id] = userData.photoURL;
                    } else {
                        names[docSnap.id] = 'Bilinmeyen Kullanıcı';
                    }
                }
            }
            setChats(items);
            setUserNames(names);
            setUserAvatars(avatars);
            setLoading(false);
        });
        return unsubscribe;
    }, [user]);

    const handleChatPress = (chatId: string, name: string, photoURL?: string) => {
        router.push({ pathname: '/chat/[id]', params: { id: chatId, sellerName: name, sellerPhoto: photoURL } });
    };

    if (!user) {
        return (
            <WebLayout>
                <View style={styles.centerContainer}>
                    <Text style={styles.messageText}>Mesajlarınızı görmek için giriş yapmalısınız.</Text>
                </View>
            </WebLayout>
        );
    }

    return (
        <WebLayout showFooter={false}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.container}>
                    <View style={styles.card}>
                        <Text style={styles.title}>Mesajlarım</Text>

                        {loading ? (
                            <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 40 }} />
                        ) : chats.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="chatbubble-ellipses-outline" size={64} color={Colors.textSecondary} />
                                <Text style={styles.emptyText}>Henüz mesajınız yok.</Text>
                            </View>
                        ) : (
                            <View style={styles.list}>
                                {chats.map((chat) => {
                                    const name = userNames[chat.id] || 'Sohbet';
                                    const avatarUrl = userAvatars[chat.id];
                                    const lastDate = chat.lastMessageAt?.toDate ? chat.lastMessageAt.toDate().toLocaleDateString('tr-TR') : '';

                                    return (
                                        <Pressable
                                            key={chat.id}
                                            style={({ pressed }) => [styles.chatItem, pressed && styles.chatItemPressed]}
                                            onPress={() => handleChatPress(chat.id, name, avatarUrl)}
                                        >
                                            <Image
                                                source={{ uri: avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) }}
                                                style={styles.avatar}
                                            />
                                            <View style={styles.chatInfo}>
                                                <View style={styles.chatHeader}>
                                                    <Text style={styles.chatName}>{name}</Text>
                                                    <Text style={styles.chatDate}>{lastDate}</Text>
                                                </View>
                                                <Text style={styles.lastMessage} numberOfLines={1}>
                                                    {chat.lastMessage || 'Mesaj yok'}
                                                </Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}
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
        alignItems: 'center',
        paddingVertical: 40,
    },
    centerContainer: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageText: {
        fontSize: 18,
        color: Colors.textSecondary,
    },
    card: {
        width: '100%',
        maxWidth: 800,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 500,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        minHeight: 300,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    list: {
        flex: 1,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: 16,
        borderRadius: 8,
    },
    chatItemPressed: {
        backgroundColor: '#f8f9fa',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.border,
    },
    chatInfo: {
        flex: 1,
        gap: 4,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chatName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    chatDate: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    lastMessage: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
});
