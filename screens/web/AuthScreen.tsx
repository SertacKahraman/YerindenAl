import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import WebFooter from '../../components/web/WebFooter';
import WebLayout from '../../components/web/WebLayout';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function AuthScreenWeb() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();
    const { signIn, signUp } = useAuth();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const formatPhoneInput = (raw: string) => {
        const cleaned = raw.replace(/[^0-9]/g, '').slice(0, 10);
        const p1 = cleaned.slice(0, 3);
        const p2 = cleaned.slice(3, 6);
        const p3 = cleaned.slice(6, 8);
        const p4 = cleaned.slice(8, 10);
        let formatted = '';
        if (p1) formatted += `(${p1}`;
        if (p1.length === 3) formatted += ')';
        if (p2) formatted += ` ${p2}`;
        if (p3) formatted += ` ${p3}`;
        if (p4) formatted += ` ${p4}`;
        return formatted;
    };

    const capitalizeNoSpaceTr = (text: string) =>
        text
            .replace(/\s+/g, '')
            .replace(/^(.)/, (m) => m.toLocaleUpperCase('tr-TR'))
            .replace(/(.)(.*)/, (m, p1, p2) => p1 + p2.toLocaleLowerCase('tr-TR'));

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setErrorMessage('');

            if (!email || !password) {
                setErrorMessage('Lütfen tüm alanları doldurun.');
                setLoading(false);
                return;
            }

            if (!validateEmail(email)) {
                setErrorMessage('Geçerli bir e-posta adresi girin.');
                setLoading(false);
                return;
            }

            if (password.length < 6) {
                setErrorMessage('Şifre en az 6 karakter olmalıdır.');
                setLoading(false);
                return;
            }

            if (!isLogin) {
                if (!firstName || !lastName) {
                    setErrorMessage('Lütfen adınızı ve soyadınızı girin.');
                    setLoading(false);
                    return;
                }
                if (!phone) {
                    setErrorMessage('Lütfen telefon numaranızı girin.');
                    setLoading(false);
                    return;
                }

                const usersRef = collection(db, 'users');
                const qEmail = query(usersRef, where('email', '==', email));
                const qPhone = query(usersRef, where('phone', '==', phone));
                const [emailSnap, phoneSnap] = await Promise.all([
                    getDocs(qEmail),
                    getDocs(qPhone)
                ]);
                if (!emailSnap.empty) {
                    setErrorMessage('Bu e-posta ile kayıtlı bir kullanıcı var.');
                    setLoading(false);
                    return;
                }
                if (!phoneSnap.empty) {
                    setErrorMessage('Bu telefon numarası ile kayıtlı bir kullanıcı var.');
                    setLoading(false);
                    return;
                }
            }

            if (isLogin) {
                await signIn(email, password);
                router.replace('/');
            } else {
                await signUp(email, password, firstName, lastName, phone);
                router.replace('/');
            }
        } catch (error: any) {
            console.error('Auth Error:', error);
            setErrorMessage(error.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <WebLayout showFooter={false}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.container}>
                    <View style={styles.card}>
                        <Text style={styles.title}>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</Text>
                        <Text style={styles.subtitle}>
                            {isLogin ? 'Hesabınıza giriş yaparak alışverişe devam edin.' : 'Yeni bir hesap oluşturarak avantajlardan yararlanın.'}
                        </Text>

                        {errorMessage ? (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color={Colors.error} />
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <View style={styles.form}>
                            {!isLogin && (
                                <View style={styles.row}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Ad</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={capitalizeNoSpaceTr(firstName)}
                                            onChangeText={text => setFirstName(capitalizeNoSpaceTr(text))}
                                            placeholder="Adınız"
                                        />
                                    </View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Soyad</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={capitalizeNoSpaceTr(lastName)}
                                            onChangeText={text => setLastName(capitalizeNoSpaceTr(text))}
                                            placeholder="Soyadınız"
                                        />
                                    </View>
                                </View>
                            )}

                            {!isLogin && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Telefon</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formatPhoneInput(phone)}
                                        onChangeText={text => {
                                            let cleaned = text.replace(/[^0-9]/g, '');
                                            if (cleaned.startsWith('90')) cleaned = cleaned.slice(2);
                                            if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
                                            setPhone(cleaned.slice(0, 10));
                                        }}
                                        placeholder="(5__) ___ __ __"
                                        maxLength={15}
                                    />
                                </View>
                            )}

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>E-posta</Text>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="ornek@email.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Şifre</Text>
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="******"
                                    secureTextEntry
                                />
                            </View>

                            <Pressable
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={Colors.white} />
                                ) : (
                                    <Text style={styles.buttonText}>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</Text>
                                )}
                            </Pressable>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>
                                    {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
                                </Text>
                                <Pressable onPress={() => setIsLogin(!isLogin)}>
                                    <Text style={styles.linkText}>
                                        {isLogin ? 'Kayıt Olun' : 'Giriş Yapın'}
                                    </Text>
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
        backgroundColor: '#f8f9fa',
    },
    card: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF0F0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
        gap: 8,
    },
    errorText: {
        color: Colors.error,
        fontSize: 14,
    },
    form: {
        gap: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    inputGroup: {
        flex: 1,
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },
    button: {
        height: 48,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
    },
    footerText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    linkText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
});
