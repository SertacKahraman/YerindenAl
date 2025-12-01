import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { cityDistricts } from '../../constants/Data';
import { useAuth } from '../../context/AuthContext';

export default function EditProfileScreen() {
    const { user, updateProfile } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();

    // Phone formatting helper (same as in auth.tsx)
    const formatPhoneNumber = (raw: string) => {
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

    // Form state
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [city, setCity] = useState(user?.city || '');
    const [district, setDistrict] = useState(user?.district || '');
    const [role, setRole] = useState<'USER' | 'SELLER' | 'BOTH' | 'ADMIN'>(user?.role || 'USER');

    // Modal state
    const [cityModalVisible, setCityModalVisible] = useState(false);
    const [districtModalVisible, setDistrictModalVisible] = useState(false);

    const handleNameChange = (text: string, setter: (value: string) => void) => {
        const formatted = text
            .split(' ')
            .map(word => word.length > 0 ? word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1) : '')
            .join(' ');
        setter(formatted);
    };

    const handleSave = async () => {
        if (!user) return;
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Hata', 'Ad ve soyad alanları zorunludur.');
            return;
        }

        setLoading(true);
        try {
            const userData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: phone, // Phone is already clean 10 digits
                bio: bio.trim(),
                city: city.trim(),
                district: district.trim(),
                role: role,
                updatedAt: new Date().toISOString()
            };

            await updateProfile(userData);

            Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.', [
                { text: 'Tamam', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (
        label: string,
        value: string,
        onChangeText: (text: string) => void,
        placeholder: string,
        icon: keyof typeof Ionicons.glyphMap,
        multiline = false,
        keyboardType: any = 'default'
    ) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputContainer, multiline && styles.textAreaContainer]}>
                <Ionicons name={icon} size={20} color={Colors.textSecondary} style={[styles.inputIcon, multiline && { marginTop: 12 }]} />
                <TextInput
                    style={[styles.input, multiline && styles.textArea]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textSecondary}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Profili Düzenle</Text>
                <Pressable onPress={handleSave} disabled={loading} style={styles.saveButton}>
                    {loading ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                        <Text style={styles.saveButtonText}>Kaydet</Text>
                    )}
                </Pressable>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
                    showsVerticalScrollIndicator={false}
                >

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
                            <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
                        </View>
                        <View style={styles.card}>
                            {renderInput('Ad', firstName, (text) => handleNameChange(text, setFirstName), 'Adınız', 'person-outline')}
                            <View style={styles.divider} />
                            {renderInput('Soyad', lastName, (text) => handleNameChange(text, setLastName), 'Soyadınız', 'person-outline')}
                            <View style={styles.divider} />

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Telefon</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="call-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={formatPhoneNumber(phone)}
                                        onChangeText={text => {
                                            let cleaned = text.replace(/[^0-9]/g, '');
                                            if (cleaned.startsWith('90')) cleaned = cleaned.slice(2);
                                            if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
                                            cleaned = cleaned.slice(0, 10);

                                            // Detect deletion of formatting character
                                            const formattedCurrent = formatPhoneNumber(phone);
                                            if (text.length < formattedCurrent.length && cleaned === phone) {
                                                setPhone(cleaned.slice(0, -1));
                                            } else {
                                                setPhone(cleaned);
                                            }
                                        }}
                                        placeholder="(5__) ___ __ __"
                                        placeholderTextColor={Colors.textSecondary}
                                        keyboardType="phone-pad"
                                        maxLength={15}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="location-outline" size={24} color={Colors.primary} />
                            <Text style={styles.sectionTitle}>Adres Bilgileri</Text>
                        </View>
                        <View style={styles.card}>
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>İl</Text>
                                        <Pressable
                                            style={styles.inputContainer}
                                            onPress={() => {
                                                setCityModalVisible(true);
                                            }}
                                        >
                                            <Ionicons name="map-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                                            <Text style={[styles.input, !city && { color: Colors.textSecondary }]}>
                                                {city || 'Seçiniz'}
                                            </Text>
                                            <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                                        </Pressable>
                                    </View>
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>İlçe</Text>
                                        <Pressable
                                            style={[styles.inputContainer, !city && { backgroundColor: '#f0f0f0', borderColor: '#e0e0e0' }]}
                                            onPress={() => {
                                                if (city) {
                                                    setDistrictModalVisible(true);
                                                } else {
                                                    Alert.alert('Uyarı', 'Lütfen önce il seçiniz.');
                                                }
                                            }}
                                        >
                                            <Ionicons name="navigate-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                                            <Text style={[styles.input, !district && { color: Colors.textSecondary }]}>
                                                {district || 'Seçiniz'}
                                            </Text>
                                            <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
                            <Text style={styles.sectionTitle}>Hakkımda</Text>
                        </View>
                        <View style={styles.card}>
                            {renderInput('Biyografi', bio, setBio, 'Kendinizden veya işletmenizden kısaca bahsedin...', 'create-outline', true)}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="people-circle-outline" size={24} color={Colors.primary} />
                            <Text style={styles.sectionTitle}>Kullanıcı Tipi</Text>
                        </View>
                        <View style={styles.roleContainer}>
                            <Pressable
                                style={[styles.roleButton, role === 'USER' && styles.roleButtonActive]}
                                onPress={() => setRole('USER')}
                            >
                                <View style={[styles.roleIconBadge, role === 'USER' && styles.roleIconBadgeActive]}>
                                    <Ionicons name="cart-outline" size={24} color={role === 'USER' ? Colors.white : Colors.textSecondary} />
                                </View>
                                <Text style={[styles.roleText, role === 'USER' && styles.roleTextActive]}>Alıcı</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.roleButton, role === 'SELLER' && styles.roleButtonActive]}
                                onPress={() => setRole('SELLER')}
                            >
                                <View style={[styles.roleIconBadge, role === 'SELLER' && styles.roleIconBadgeActive]}>
                                    <Ionicons name="storefront-outline" size={24} color={role === 'SELLER' ? Colors.white : Colors.textSecondary} />
                                </View>
                                <Text style={[styles.roleText, role === 'SELLER' && styles.roleTextActive]}>Satıcı</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.roleButton, role === 'BOTH' && styles.roleButtonActive]}
                                onPress={() => setRole('BOTH')}
                            >
                                <View style={[styles.roleIconBadge, role === 'BOTH' && styles.roleIconBadgeActive]}>
                                    <Ionicons name="people-outline" size={24} color={role === 'BOTH' ? Colors.white : Colors.textSecondary} />
                                </View>
                                <Text style={[styles.roleText, role === 'BOTH' && styles.roleTextActive]}>Her İkisi</Text>
                            </Pressable>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* City Selection Modal */}
            <SelectionModal
                visible={cityModalVisible}
                onClose={() => setCityModalVisible(false)}
                title="İl Seçiniz"
                data={Object.keys(cityDistricts).sort()}
                onSelect={(selectedCity) => {
                    setCity(selectedCity);
                    setDistrict(''); // Reset district when city changes
                }}
            />

            {/* District Selection Modal */}
            <SelectionModal
                visible={districtModalVisible}
                onClose={() => setDistrictModalVisible(false)}
                title="İlçe Seçiniz"
                data={city ? (cityDistricts[city] || []).sort() : []}
                onSelect={(selectedDistrict) => setDistrict(selectedDistrict)}
            />
        </View>
    );
}

function SelectionModal({
    visible,
    onClose,
    title,
    data,
    onSelect
}: {
    visible: boolean,
    onClose: () => void,
    title: string,
    data: string[],
    onSelect: (item: string) => void
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            setSearchQuery('');
        }
    }, [visible]);

    const filteredData = data.filter(item =>
        item.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR'))
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={Colors.text} />
                        </Pressable>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Ara..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>

                    <FlatList
                        data={filteredData}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.modalItem}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={styles.modalItemText}>{item}</Text>
                                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                            </Pressable>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        zIndex: 10,
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    saveButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: Colors.primary + '10',
    },
    saveButtonText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginLeft: 8,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F3F5',
    },
    inputGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 6,
        fontWeight: '600',
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
        borderRadius: 12,
        paddingHorizontal: 12,
        minHeight: 50,
    },
    textAreaContainer: {
        alignItems: 'flex-start',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: Colors.text,
    },
    textArea: {
        minHeight: 100,
        paddingTop: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F3F5',
        marginVertical: 12,
    },
    row: {
        flexDirection: 'row',
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    roleButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    roleButtonActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '05',
    },
    roleIconBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    roleIconBadgeActive: {
        backgroundColor: Colors.primary,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    roleTextActive: {
        color: Colors.primary,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        color: Colors.text,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F9FA',
    },
    modalItemText: {
        fontSize: 16,
        color: Colors.text,
    },
});
