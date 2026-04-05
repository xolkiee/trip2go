# Ömer Arı'nın Web Frontend Görevleri

**Front-end Test Videosu:** [Youtube Linki](https://www.youtube.com/watch?v=6MhhoSNWSoE)

## 1. Kimlik Doğrulama: Giriş Yap ve Kayıt Ol (`Auth.jsx`)
- **API Endpoint:** `POST /api/auth/login`, `POST /api/auth/register`
- **Görev:** Kullanıcıların sisteme güvenli bir şekilde dahil olmasını ve oturum açmasını sağlayan merkezi kimlik doğrulama bileşeni.
- **UI Özellikleri:**
  - Login ve Register arasında pürüzsüz geçiş sağlayan Tab yapısı.
  - Hata mesajları için dinamik Alert kutuları.
  - Yükleme sırasında butona eklenen "Lütfen Bekleyin..." durum göstergesi (Loading state).
- **Validasyon Kuralları:**
  - **E-Posta Kontrolü:** Sadece `.com` uzantılı e-posta adreslerine izin veren Regex kontrolü.
  - Zorunlu alanların (Ad, Soyad, Email, Şifre) boş bırakılamaması.
- **Teknik Detaylar:**
  - Başarılı giriş sonrası `localStorage` üzerine `trip2go_token` ve `trip2go_user` verilerinin kaydedilmesi.
  - Kullanıcı rolüne göre (User/Admin) farklı sayfalara (`/trips` veya `/admin/trips/new`) otomatik yönlendirme.

## 2. Yönetici Kimlik Doğrulama (`AdminAuth.jsx`)
- **API Endpoint:** `POST /api/auth/login`, `POST /api/auth/admin-register`
- **Görev:** Otobüs ve Uçak firması yetkililerinin sisteme kayıt olup yönetici paneline erişmesini sağlayan özel yetkilendirme sayfası.
- **UI Özellikleri:**
  - Firma tipi seçimi (Otobüs/Uçak) için özel Select kutusu.
  - "Firma Kayıt Anahtarı" (Secret Key) giriş alanı.
- **Validasyon ve Güvenlik:**
  - `trip2go-admin` gizli anahtarı olmadan yönetici kaydı yapılamaması.
  - Sadece Admin rolüne sahip kullanıcıların bu panel üzerinden giriş yapabilmesi.

## 3. Gelişmiş Sefer Arama Arayüzü (`Trips.jsx`)
- **API Endpoint:** `GET /api/locations`, `GET /api/trips/search`
- **Görev:** Kullanıcının binlerce lokasyon arasından seçim yaparak kriterlerine uygun seferleri filtrelediği ana arama motoru.
- **UI Özellikleri:**
  - **SearchableSelect Bileşeni:** Yazılan harfe göre anlık filtreleme yapan (Autocomplete) ve Türkçe karakter (İ-i, I-ı) duyarlı akıllı seçim kutusu.
  - **Hero Bölümü:** Otobüs ve Uçak sekmeleriyle ayrılmış, kalkış/varış yer değiştirme (Switch) butonuna sahip yatay arama çubuğu.
  - **Sefer Kartları:** Firma adı, puanı (rating), kalkış/varış saati, kalan koltuk sayısı ve dinamik fiyat bilgisini içeren interaktif kartlar.
- **Teknik Detaylar:**
  - `sessionStorage` kullanımı: Kullanıcının arama kriterlerini (Nereden, Nereye, Tarih, Tip) tarayıcı hafızasında tutarak sayfa yenilense bile verilerin korunması.
  - Tip (Bus/Flight) değişiminde lokasyonların otomatik filtrelenmesi (Şehirler vs Havalimanları).

## 4. Şifremi Unuttum Süreci (`ForgotPassword.jsx`)
- **API Endpoint:** `POST /api/auth/forgot-password`, `PUT /api/auth/reset-password`
- **Görev:** Şifresini hatırlamayan kullanıcılar için e-posta tabanlı güvenli yenileme akışı.
- **UI Özellikleri:**
  - Adım adım ilerleyen (Step-by-step) form yapısı.
  - Yeni şifre ve şifre onay alanları.
- **Teknik Detaylar:**
  - URL'den yakalanan token bilgisi ile `PUT` isteği üzerinden şifrenin kalıcı olarak güncellenmesi.

## 5. Firma Değerlendirme ve Yorum Listesi (`TripDetails.jsx` & `MyTrips.jsx`)
- **API Endpoint:** `GET /api/reviews/trip/{id}`, `POST /api/reviews`
- **Görev:** Yolcuların deneyimlerini paylaştığı ve diğer kullanıcıların bu yorumları gördüğü sosyal katman.
- **UI Özellikleri:**
  - **Review Card:** Maskelenmiş kullanıcı adı (Örn: Ö*** A***), yıldız puanlama (Star rating) ve yorum metni.
  - **Rating Summary:** Sefer arama sonuçlarında görünen ortalama puan ve toplam yorum sayısı özeti.
- **Teknik Detaylar:**
  - Kullanıcı adlarının gizlilik gereği (KVKK) backend'den maskelenmiş (`maskedUser`) olarak çekilip gösterilmesi.
  - `TripDetails` sayfasında seçilen sefere ait tüm geçmiş yorumların scroll edilebilir alanda listelenmesi.
