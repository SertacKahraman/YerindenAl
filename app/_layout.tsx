import { Stack } from 'expo-router';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { AuthProvider } from '../context/AuthContext';
import { LocationProvider } from '../context/LocationContext';

export default function Layout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <LocationProvider>
          <View style={styles.container}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: {
                  backgroundColor: Colors.background,
                },
              }}
            >
              <Stack.Screen
                name="index"
                options={{
                  animation: 'none',
                }}
              />
              <Stack.Screen
                name="search"
                options={{
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="search-results"
                options={{
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen name="product/[id]" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="profile" />
            </Stack>
          </View>
        </LocationProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
