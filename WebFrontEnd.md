# Web Frontend Görev Dağılımı

**Web Frontend Adresi:** [frontend.yazmuh.com](https://frontend.yazmuh.com)

Bu dokümanda, web uygulamasının kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir. Her grup üyesi, kendisine atanan sayfaların tasarımı, implementasyonu ve kullanıcı etkileşimlerinden sorumludur.

---

## Grup Üyelerinin Web Frontend Görevleri

1. [Furkan Burak Öztürk'ün Web Frontend Görevleri](Furkan-Burak-Öztürk/Furkan-Burak-Öztürk-Web-Frontend-Gorevleri.md)
2. [Ömer Arı'nın Web Frontend Görevleri](Ömer-Arı/Ömer-Arı-Web-Frontend-Gorevleri.md)

---

## Genel Web Frontend Prensipleri

### 1. Responsive Tasarım
- **Modern Layouts:** Sayfa tasarımları CSS Flexbox ve CSS Grid kullanılarak esnek bir yapıda oluşturulmuştur.
- **Breakpoints:** Mobil, tablet ve masaüstü görünümleri için `@media` sorguları ile uyumluluk sağlanmıştır.
- **Interactive UI:** Butonlar, inputlar ve koltuk seçim alanları dokunmatik cihazlara uygun boyutlarda (min 44x44px) tasarlanmıştır.

### 2. Tasarım Sistemi ve Stil Yönetimi
- **Vanilla CSS:** Projede harici bir kütüphane yerine saf CSS (Vanilla CSS) tercih edilerek maksimum performans ve özelleştirme sağlanmıştır.
- **Renk ve Tipografi:** `.css` dosyalarında genel değişkenler kullanılarak marka renkleri (Koyu Mavi, Turuncu, Slate tonları) ve modern tipografi (Inter/Roboto) standartlaştırılmıştır.
- **Component Styling:** Her sayfa ve bileşen için özel `.css` dosyaları (örneğin: `TripDetails.css`, `Auth.css`) kullanılarak stil izolasyonu sağlanmıştır.

### 3. Performans ve React Yapısı
- **Vite:** Projenin build süreci için ultra hızlı Vite aracı kullanılmaktadır.
- **Modern React:** React 19 özellikleri kullanılarak performanslı bir render akışı sağlanmıştır.
- **Efficient Rendering:** State değişimleri ve bilet listelemeleri verimli bir şekilde yönetilir.

### 4. SEO ve Meta Yönetimi
- **Semantic HTML:** Sayfalar `h1`, `section`, `header`, `footer` gibi anlamsal etiketlerle yapılandırılmıştır.
- **Sayfa Başlıkları:** Farklı sayfalar için açıklayıcı başlıklar (Bilet Ara, Ödeme Yap, Profilim vb.) kullanılmıştır.

### 5. Erişilebilirlik (Accessibility)
- **Keyboard Navigation:** Sayfa içerisindeki formlar ve butonlar `Tab` tuşu ile kontrol edilebilir.
- **Aria Labels:** Görsel öğeler ve durumlar (loading states) için açıklayıcı etiketleme kuralları izlenmiştir.

### 6. State Management
- **Local State:** Form verileri ve geçici seçimler için `useState` ve `useReducer` kullanılmaktadır.
- **Effect Management:** API çağrıları ve zamanlayıcı (Timer) işlemleri için `useEffect` tercih edilmiştir.
- **Global Auth:** Kullanıcı oturum durumu ve sepet yönetimi `localStorage` üzerinden senkronize edilmektedir.

### 7. Routing (Yönlendirme)
- **React Router:** Sayfalar arası geçişler için `react-router-dom` (Version 7) kütüphanesi kullanılmaktadır.
- **Protected Routes:** Admin paneli ve bilet detayları gibi alanlar için yetkilendirme kontrolleri sayfa bazlı uygulanmaktadır.

### 8. API Entegrasyonu
- **Native Fetch API:** HTTP istekleri için ek bir kütüphane yerine tarayıcı tabanlı `fetch` API kullanılarak bundle boyutu optimize edilmiştir.
- **Request/Response Handling:** Hata yönetimi (error handling) ve yükleme durumu (loading status) her istek için özel olarak yönetilmiştir.

### 9. Build ve Deployment
- **Build Tool:** Vite üzerinden optimize edilmiş üretim dosyaları (minified JS/CSS) oluşturulmaktadır.
- **Hosting:** Uygulama **Vercel** üzerinde barındırılmaktadır ve GitHub üzerinden otomatik CI/CD süreçleri ile yayına alınmaktadır.
