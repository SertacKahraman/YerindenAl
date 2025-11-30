import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { popularSearches } from '../constants/Data';

export default function SearchScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const searchInputRef = useRef<TextInput>(null);



    // Arama geçmişini kaydet
    const saveSearchHistory = (query: string) => {
        if (query.trim()) {
            setSearchHistory(prev => {
                const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5);
                return newHistory;
            });
        }
    };

    // Arama geçmişini temizle
    const clearSearchHistory = () => {
        setSearchHistory([]);
    };

    // Arama yap
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        saveSearchHistory(query);
        router.push({
            pathname: '/search-results',
            params: { query }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable
                    style={{ padding: 8, marginRight: 8 }}
                    onPress={() => router.push('/')}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </Pressable>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color={Colors.primary} />
                    <TextInput
                        ref={searchInputRef}
                        style={styles.searchInput}
                        placeholder="İlan ara..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                        returnKeyType="search"
                        onSubmitEditing={() => handleSearch(searchQuery)}
                        blurOnSubmit={false}
                        keyboardAppearance="light"
                        autoCorrect={false}
                        autoCapitalize="none"
                        spellCheck={false}
                    />
                    {searchQuery ? (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                        </Pressable>
                    ) : null}
                </View>
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.push('/')}
                >
                    <Text style={styles.backButtonText}>İptal</Text>
                </Pressable>
            </View>

            <ScrollView
                style={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {searchHistory.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Son Aramalar</Text>
                            <Pressable onPress={clearSearchHistory}>
                                <Text style={styles.clearButton}>Temizle</Text>
                            </Pressable>
                        </View>
                        {searchHistory.map((item, index) => (
                            <Pressable
                                key={index}
                                style={styles.historyItem}
                                onPress={() => handleSearch(item)}
                            >
                                <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
                                <Text style={styles.historyText}>{item}</Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Popüler Aramalar</Text>
                    <View style={styles.popularSearches}>
                        {popularSearches.map((item, index) => (
                            <Pressable
                                key={index}
                                style={styles.popularSearchChip}
                                onPress={() => handleSearch(item)}
                            >
                                <Text style={styles.popularSearchText}>{item}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
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
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: Colors.text,
        padding: 0,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: Colors.primary,
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    clearButton: {
        color: Colors.primary,
        fontSize: 14,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    historyText: {
        marginLeft: 12,
        fontSize: 16,
        color: Colors.text,
    },
    popularSearches: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    popularSearchChip: {
        backgroundColor: Colors.background,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    popularSearchText: {
        color: Colors.text,
        fontSize: 14,
    },
}); 