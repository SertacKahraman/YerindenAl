import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import WebLayout from '../../components/web/WebLayout';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function ChatScreenWeb() {
    const params = useLocalSearchParams();
    const chatId = params.id as string | undefined;
    const isNewChat = !chatId || chatId === 'new';
    const sellerId = params.sellerId as string | undefined;
    const sellerNameParam = params.sellerName as string | undefined;
    const sellerPhotoParam = params.sellerPhoto as string | undefined;

    const { user } = useAuth();
    const router = useRouter();

    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [otherUser, setOtherUser] = useState<any>(sellerNameParam ? { name: sellerNameParam, photoURL: sellerPhotoParam } : null);
    const [localChatId, setLocalChatId] = useState<string | undefined>(!isNewChat ? chatId : undefined);
    const [sending, setSending] = useState(false);

    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (localChatId && user) {
            const fetchChatAndOtherUser = async () => {
                const chatRef = doc(db, 'chats', String(localChatId));
                const chatSnap = await getDoc(chatRef);
                if (chatSnap.exists()) {
                    const data = chatSnap.data();
                    const otherUserId = (data.users || []).find((uid: string) => uid !== user.id);
                    if (otherUserId) {
                        const userDoc = await getDoc(doc(db, 'users', otherUserId));
                        if (userDoc.exists()) {
                            setOtherUser(userDoc.data());
                        }
                    }
                }
            };
            fetchChatAndOtherUser();
        } else if (!localChatId && sellerId) {
            const fetchSeller = async () => {
                const userDoc = await getDoc(doc(db, 'users', sellerId));
                if (userDoc.exists()) {
                    setOtherUser(userDoc.data());
                }
            };
            fetchSeller();
        }
    }, [localChatId, user, sellerId]);

    useEffect(() => {
        if (!localChatId) return;
        const q = query(
            collection(db, 'messages'),
            where('chatId', '==', String(localChatId)),
            orderBy('createdAt', 'asc')
        );
        const unsubscribe = onSnapshot(q, (snap) => {
            const items: any[] = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            setMessages(items);
        });
        return unsubscribe;
    }, [localChatId]);

    useEffect(() => {
        if (scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !user || sending) return;
        setSending(true);

        try {
            let usedChatId = localChatId;
            let createdNewChat = false;

            if (!usedChatId && sellerId) {
                // Check for existing chat
                const chatsRef = collection(db, 'chats');
                const q = query(chatsRef, where('users', 'array-contains', user.id));
                const querySnapshot = await getDocs(q);
                let foundChatId = null;

                querySnapshot.forEach(docSnap => {
                    const data = docSnap.data();
                    if (data.users.includes(sellerId)) {
                        foundChatId = docSnap.id;
                    }
                });

                if (foundChatId) {
                    usedChatId = foundChatId;
                    setLocalChatId(foundChatId);
                } else {
                    // Create new chat
                    const newChat = {
                        users: [user.id, sellerId],
                        lastMessage: input,
                        lastMessageAt: serverTimestamp(),
                    };
                    const docRef = await addDoc(collection(db, 'chats'), newChat);
                    usedChatId = docRef.id;
                    setLocalChatId(docRef.id);
                    createdNewChat = true;
                }
            }

            await addDoc(collection(db, 'messages'), {
                chatId: String(usedChatId),
                senderId: user.id,
                text: input,
                createdAt: serverTimestamp(),
            });

            await updateDoc(doc(db, 'chats', String(usedChatId)), {
                lastMessage: input,
                lastMessageAt: serverTimestamp(),
            });

            setInput('');

            if (createdNewChat && usedChatId) {
                router.replace({
                    pathname: '/chat/[id]',
                    params: {
                        id: usedChatId,
                        sellerName: otherUser?.name,
                        sellerPhoto: otherUser?.photoURL,
                        sellerId,
                    }
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    if (!user) {
        return (
            <WebLayout>
                <View style={styles.centerContainer}>
                    <Text style={styles.messageText}>Sohbet etmek için giriş yapmalısınız.</Text>
                </View>
            </WebLayout>
        );
    }

    return (
        <WebLayout>
            <View style={styles.container}>
                <View style={styles.chatCard}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={Colors.text} />
                        </Pressable>
                        <Image
                            source={{ uri: otherUser?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(otherUser?.name || 'Kullanıcı') }}
                            style={styles.avatar}
                        />
                        <Text style={styles.headerTitle}>
                            {otherUser ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || otherUser.name || 'Kullanıcı' : 'Yükleniyor...'}
                        </Text>
                    </View>

                    {/* Messages */}
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesContainer}
                        contentContainerStyle={styles.messagesContent}
                    >
                        {messages.length === 0 ? (
                            <View style={styles.emptyChat}>
                                <Text style={styles.emptyChatText}>Henüz mesaj yok. İlk mesajı gönderin!</Text>
                            </View>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.senderId === user.id;
                                return (
                                    <View key={msg.id} style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
                                        <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
                                            <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextOther]}>
                                                {msg.text}
                                            </Text>
                                            <Text style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeOther]}>
                                                {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>

                    {/* Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={input}
                            onChangeText={setInput}
                            placeholder="Mesajınızı yazın..."
                            placeholderTextColor={Colors.textSecondary}
                            multiline
                            onKeyPress={(e) => {
                                if (e.nativeEvent.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <Pressable
                            style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={!input.trim() || sending}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                                <Ionicons name="send" size={20} color={Colors.white} />
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </WebLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 20,
        height: '100%',
    },
    centerContainer: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatCard: {
        width: '100%',
        maxWidth: 800,
        height: 700,
        backgroundColor: Colors.white,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.white,
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    messagesContent: {
        padding: 20,
        gap: 8,
    },
    emptyChat: {
        padding: 40,
        alignItems: 'center',
    },
    emptyChatText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    messageRowMe: {
        justifyContent: 'flex-end',
    },
    messageRowOther: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '70%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
    },
    messageBubbleMe: {
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 4,
    },
    messageBubbleOther: {
        backgroundColor: Colors.white,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    messageTextMe: {
        color: Colors.white,
    },
    messageTextOther: {
        color: Colors.text,
    },
    messageTime: {
        fontSize: 11,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    messageTimeMe: {
        color: 'rgba(255,255,255,0.7)',
    },
    messageTimeOther: {
        color: Colors.textSecondary,
    },
    inputContainer: {
        padding: 16,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
        backgroundColor: Colors.textSecondary,
    },
});
