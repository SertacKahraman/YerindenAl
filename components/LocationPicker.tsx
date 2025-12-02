import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Colors } from '../constants/Colors';

interface LocationPickerProps {
    locationCoords: { latitude: number; longitude: number } | null;
    onMapPress: (event: any) => void;
}

export default function LocationPicker({ locationCoords, onMapPress }: LocationPickerProps) {
    return (
        <View style={styles.mapContainer}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: locationCoords?.latitude || 39.9334,
                    longitude: locationCoords?.longitude || 32.8597,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                region={locationCoords ? {
                    latitude: locationCoords.latitude,
                    longitude: locationCoords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                } : undefined}
                onPress={onMapPress}
            >
                {locationCoords && (
                    <Marker
                        coordinate={locationCoords}
                        title="Seçilen Konum"
                    />
                )}
            </MapView>
            <View style={styles.mapOverlay}>
                <Text style={styles.mapOverlayText}>Konum seçmek için haritaya dokunun</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        height: 300,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 16,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 6,
        borderRadius: 8,
        alignItems: 'center',
    },
    mapOverlayText: {
        fontSize: 12,
        color: Colors.text,
        fontWeight: '500',
    },
});
