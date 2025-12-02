import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface LocationPickerProps {
    locationCoords: { latitude: number; longitude: number } | null;
    onMapPress: (event: any) => void;
}

export default function LocationPicker({ locationCoords, onMapPress }: LocationPickerProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Harita görünümü web sürümünde desteklenmemektedir.</Text>
            <Text style={styles.subText}>Lütfen konumu yukarıdaki buton ile seçin veya adresi manuel girin.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 150,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 16,
        padding: 16,
    },
    text: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 8,
    },
    subText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
    }
});
