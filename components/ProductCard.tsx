import { Ionicons } from '@expo/vector-icons';
import { Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface ProductCardProps {
    title: string;
    price: number;
    image: string;
    location?: string;
    onPress: () => void;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

export default function ProductCard({ title, price, image, location, onPress, isFavorite, onToggleFavorite }: ProductCardProps) {
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';

    const cardWidth = isWeb ? (width > 1200 ? 320 : width / 2.3 - 18) : width / 1.6 - 18;

    return (
        <Pressable
            style={[styles.container, { width: cardWidth }]}
            onPress={onPress}
        >
            <View>
                <Image
                    source={{ uri: image }}
                    style={styles.image}
                    resizeMode="cover"
                />
                {onToggleFavorite && (
                    <Pressable
                        style={styles.favoriteButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onToggleFavorite();
                        }}
                    >
                        <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={Colors.primary} />
                    </Pressable>
                )}
            </View>
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                <Text style={styles.price}>{price.toLocaleString('tr-TR')} ₺</Text>
                {location && (
                    <Text style={styles.location} numberOfLines={1}>{location}</Text>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        margin: 6,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    image: {
        width: '100%',
        height: 140,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 16,
        padding: 4,
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    content: {
        padding: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: Colors.text,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    location: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 4,
    },
}); 