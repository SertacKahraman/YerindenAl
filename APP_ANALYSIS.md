# YerindenAl (Sanalpazar) Uygulama Analizi

Bu belge, mevcut kod tabanının incelenmesi sonucunda oluşturulan genel yapı analizi, gereksinimler ve önerilen geliştirmeleri içerir.

## 1. Genel Yapı Analizi

Proje, **React Native** ve **Expo** ekosistemi üzerine inşa edilmiş, modern bir mobil uygulama yapısına sahiptir.

### Teknoloji Yığını (Tech Stack)
*   **Framework:** React Native (Expo SDK 54)
*   **Dil:** TypeScript
*   **Yönlendirme (Routing):** Expo Router (Dosya tabanlı yönlendirme - `app/` dizini)
*   **Veritabanı & Backend:**
    *   **Firebase:** Authentication ve Firestore (Veri saklama) aktif olarak kullanılıyor (`app/index.tsx` içinde görülüyor).
    *   **Prisma & PostgreSQL:** Projede `prisma/schema.prisma` dosyası mevcut, bu da ilişkisel bir veritabanı yapısının (PostgreSQL) planlandığını veya hibrit bir yapı kullanıldığını gösteriyor.
*   **Durum Yönetimi (State Management):** React Context API (`AuthContext`, `CartContext`, `LocationContext`).
*   **Stil:** React Native `StyleSheet`.

### Dizin Yapısı
*   **`app/`**: Uygulamanın ekranları ve navigasyon yapısı burada bulunur. `_layout.tsx` ana layout dosyasıdır.
*   **`components/`**: Tekrar kullanılabilir UI bileşenleri (örn. `ProductCard`, `BottomNav`).
*   **`context/`**: Uygulama genelinde paylaşılan durumlar (Oturum, Sepet, Konum).
*   **`constants/`**: Sabit değerler (Renkler, Ayarlar).
*   **`prisma/`**: Veritabanı şeması.
*   **`types/`**: TypeScript tip tanımları.

## 2. Uygulama Gereksinimleri

Uygulamanın çalıştırılması ve geliştirilmesi için aşağıdaki gereksinimler bulunmaktadır:

### Geliştirme Ortamı
*   **Node.js:** JavaScript çalışma zamanı.
*   **Paket Yöneticisi:** npm veya yarn.
*   **Expo CLI:** Yerel geliştirme sunucusu için (`npx expo start`).
*   **Mobil Cihaz veya Emülatör:** Expo Go uygulaması yüklü bir telefon veya Android Studio/Xcode simülatörü.

### Servis Bağlantıları
*   **Firebase Konfigürasyonu:** `config/firebase.js` (veya benzeri) dosyasında geçerli API anahtarlarının bulunması gerekir.
*   **Veritabanı (Opsiyonel/Gelecek):** Eğer Prisma aktif edilecekse, çalışan bir PostgreSQL sunucusu ve `DATABASE_URL` çevre değişkeni.

## 3. Eklenebilecek Özellikler ve İyileştirmeler

Uygulamayı daha ölçeklenebilir, performanslı ve kullanıcı dostu hale getirmek için aşağıdaki geliştirmeler önerilir:

### Mimari ve Kod Kalitesi
1.  **Custom Hooks (Özel Kancalar):** `HomeScreen` içerisindeki veri çekme (fetching) ve filtreleme mantığı, `useProducts` gibi özel hook'lara taşınarak kodun okunabilirliği artırılabilir.
2.  **Veri Yönetimi (React Query):** Firebase istekleri için `TanStack Query` (React Query) kullanılması, önbellekleme (caching), yükleme durumları ve hata yönetimi için büyük avantaj sağlar.
3.  **Sabit Verilerin Yönetimi:** Şehirler ve Kategoriler şu anda kodun içine gömülü (hardcoded). Bu veriler bir veritabanı tablosundan veya merkezi bir `constants` dosyasından çekilmelidir.

### UI/UX (Kullanıcı Deneyimi)
1.  **Gelişmiş Filtreleme:** Şu anki filtreleme istemci tarafında (client-side) yapılıyor. Veri sayısı arttığında bu performans sorunu yaratabilir. Filtreleme işlemleri sunucu tarafında (Firestore query veya Backend API) yapılmalıdır.
2.  **Modern Stil Kütüphanesi:** `NativeWind` (Tailwind CSS for React Native) veya `Tamagui` gibi kütüphaneler kullanılarak stil yazımı hızlandırılabilir ve tutarlılık artırılabilir.
3.  **Animasyonlar:** `react-native-reanimated` kütüphanesi ile sayfa geçişleri ve etkileşimler daha akıcı hale getirilebilir (Mevcut durumda `LayoutAnimation` veya basit geçişler kullanılıyor olabilir).

### Özellik Önerileri
1.  **Bildirim Sistemi:** Expo Notifications kullanılarak sipariş durumu, yeni mesajlar vb. için push bildirimleri eklenebilir.
2.  **Harita Entegrasyonu:** İlanların konumunu harita üzerinde göstermek için `react-native-maps` entegrasyonu.
3.  **Karanlık Mod (Dark Mode):** `useColorScheme` zaten kullanılıyor, tüm bileşenlerin karanlık moda tam uyumlu olduğundan emin olunmalı.
4.  **Çoklu Dil Desteği (i18n):** Uygulamanın farklı dillere kolayca çevrilebilmesi için `i18next` entegrasyonu.

### Test ve CI/CD
1.  **Birim Testleri:** `Jest` ve `React Native Testing Library` ile kritik bileşenlerin test edilmesi.
2.  **Otomatik Dağıtım:** EAS (Expo Application Services) kullanılarak build ve update süreçlerinin otomatize edilmesi.

## 4. Özet

YerindenAl projesi, modern teknolojilerle başlatılmış sağlam bir temele sahiptir. Özellikle Expo Router kullanımı geleceğe dönük iyi bir tercihtir. Ancak, projenin büyümesiyle birlikte veri yönetimi ve performans optimizasyonlarına (React Query, Server-side filtering) odaklanılması gerekecektir.
