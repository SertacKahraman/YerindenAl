import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string) => {
        return password.length >= 6;
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

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

            if (!isLogin && !name) {
                Alert.alert('Hata', 'Lütfen adınızı girin.');
                return;
            }

            if (!isLogin && !phone) {
                Alert.alert('Hata', 'Lütfen telefon numaranızı girin.');
                return;
            }

            if (isLogin) {
                await signIn(email, password);
                Alert.alert('Başarılı', 'Giriş başarılı!');
                router.replace('/');
            } else {
                console.log('signUp fonksiyonu çağrıldı', email, name, phone);
                await signUp(email, password, name, phone);
                Alert.alert('Başarılı', 'Kayıt başarılı!');
                router.replace('/');
            }
        } catch (error: any) {
            console.error('Kayıt Hatası:', error);
            let msg = 'Bir hata oluştu. Lütfen tekrar deneyin.';
            if (error && error.message) msg = error.message;
            Alert.alert('Hata', msg);
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
                                placeholder="Ad Soyad"
                                placeholderTextColor={Colors.textSecondary}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Telefon Numarası"
                                placeholderTextColor={Colors.textSecondary}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
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