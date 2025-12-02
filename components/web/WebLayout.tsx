import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import WebFooter from './WebFooter';
import WebNavbar from './WebNavbar';

interface WebLayoutProps {
    children: React.ReactNode;
    showFooter?: boolean;
}

export default function WebLayout({ children, showFooter = true }: WebLayoutProps) {
    return (
        <View style={styles.container}>
            <WebNavbar />
            <View style={styles.content}>
                {children}
            </View>
            {showFooter && <WebFooter />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        minHeight: '100vh', // Ensure full height on web
    },
    content: {
        flex: 1,
        width: '100%',
    },
});
