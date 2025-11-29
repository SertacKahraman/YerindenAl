import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../config/firebase';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';
    const router = useRouter();
    const { signIn, signUp } = useAuth();
    const [errorMessage, setErrorMessage] = useState('');
    const phoneInputRef = useRef<TextInput>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string) => {
        return password.length >= 6;
    };

    // Telefon numarasını (5xx) xxx xx xx formatında gösteren fonksiyon
    function formatPhoneInput(raw: string) {
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
    }

    // Türkçe karakterler için her kelimenin ilk harfi büyük, diğerleri küçük yapar ve boşlukları kaldırır
    const capitalizeNoSpaceTr = (text: string) =>
        text
            .replace(/\s+/g, '') // tüm boşlukları kaldır
            .replace(/^(.)/, (m) => m.toLocaleUpperCase('tr-TR')) // ilk harfi büyük yap
            .replace(/(.)(.*)/, (m, p1, p2) => p1 + p2.toLocaleLowerCase('tr-TR')); // geri kalanı küçük yap

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setErrorMessage('');

            // Form validasyonu
            if (!email || !password) {
                Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
                return;
            }

            if (!validateEmail(email)) {
                Alert.alert('Hata', 'Geçerli bir e-posta adresi girin.');
                return;
            }

            if (!validatePassword(password)) {
                Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
                return;
            }

            if (!isLogin && !firstName) {
                setErrorMessage('Lütfen adınızı girin.');
                setLoading(false);
                return;
            }

            if (!isLogin && !lastName) {
                setErrorMessage('Lütfen soyadınızı girin.');
                setLoading(false);
                return;
            }

            if (!isLogin && !phone) {
                Alert.alert('Hata', 'Lütfen telefon numaranızı girin.');
                return;
            }

            if (!isLogin) {
                // E-posta veya telefon zaten kayıtlı mı kontrol et
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
                Alert.alert('Başarılı', 'Giriş başarılı!');
                router.replace('/');
            } else {
                console.log('signUp fonksiyonu çağrıldı', email, firstName, lastName, phone);
                await signUp(email, password, firstName, lastName, phone);
                Alert.alert('Başarılı', 'Kayıt başarılı!');
                router.replace('/');
            }
        } catch (error: any) {
            console.error('Kayıt Hatası:', error);
            let msg = 'Bir hata oluştu. Lütfen tekrar deneyin.';
            if (error && error.message) msg = error.message;
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={[styles.content, isWeb && { maxWidth: 400, width: '100%', marginHorizontal: 'auto' }]}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                    </Pressable>

                    <Text style={styles.title}>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</Text>

                    {!isLogin && (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Ad"
                                placeholderTextColor={Colors.textSecondary}
                                value={capitalizeNoSpaceTr(firstName)}
                                onChangeText={text => setFirstName(capitalizeNoSpaceTr(text))}
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Soyad"
                                placeholderTextColor={Colors.textSecondary}
                                value={capitalizeNoSpaceTr(lastName)}
                                onChangeText={text => setLastName(capitalizeNoSpaceTr(text))}
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#d1d5db',
                                        borderRadius: 0,
                                        marginBottom: 16,
                                        letterSpacing: 2,
                                        fontWeight: '400',
                                        fontFamily: undefined,
                                        fontSize: 18,
                                        color: '#111',
                                        backgroundColor: 'transparent',
                                    },
                                ]}
                                placeholder="(5__) ___ __ __"
                                placeholderTextColor="#b0b0b0"
                                value={formatPhoneInput(phone)}
                                onChangeText={text => {
                                    let cleaned = text.replace(/[^0-9]/g, '');
                                    if (cleaned.startsWith('90')) cleaned = cleaned.slice(2);
                                    if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
                                    setPhone(cleaned.slice(0, 10));
                                }}
                                onKeyPress={e => {
                                    if (e.nativeEvent.key === 'Backspace') {
                                        setPhone(prev => prev.slice(0, -1));
                                    }
                                }}
                                keyboardType="phone-pad"
                                maxLength={15}
                            />
                        </>
                    )}

                    <TextInput
                        style={styles.input}
                        placeholder="E-posta"
                        placeholderTextColor={Colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Şifre"
                        placeholderTextColor={Colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {errorMessage ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffeaea', borderRadius: 8, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#ffb3b3', justifyContent: 'center' }}>
                            <Ionicons name="alert-circle" size={22} color="#d32f2f" style={{ marginRight: 8 }} />
                            <Text style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: 15 }}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed,
                            loading && styles.buttonDisabled
                        ]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'İşleniyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.switchButton}
                        onPress={() => setIsLogin(!isLogin)}
                        disabled={loading}
                    >
                        <Text style={styles.switchButtonText}>
                            {isLogin
                                ? 'Hesabınız yok mu? Kayıt olun'
                                : 'Zaten hesabınız var mı? Giriş yapın'}
                        </Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
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
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        padding: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonPressed: {
        opacity: 0.8,
        backgroundColor: Colors.primaryDark,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    switchButtonText: {
        color: Colors.primary,
        fontSize: 14,
    },
}); 