/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  primary: '#1a237e', // Koyu lacivert
  primaryLight: '#534bae', // Açık lacivert
  primaryDark: '#000051', // Çok koyu lacivert
  accent: '#4caf50', // Yeşil vurgu rengi
  background: '#ffffff', // Beyaz arka plan
  surface: '#f5f5f5', // Açık gri arka plan
  text: '#1a237e', // Koyu lacivert metin
  textSecondary: '#666666', // Gri metin
  border: '#e0e0e0', // Açık gri kenarlık
  error: '#d32f2f', // Kırmızı hata rengi
  success: '#388e3c', // Yeşil başarı rengi
  white: '#ffffff', // Beyaz
  black: '#000000', // Siyah
  transparent: 'transparent',
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
