# Furkan Burak Öztürk'ün Web Frontend Görevleri

**Front-end Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Sefer Detay Sayfası
- **API Endpoint:** `POST /api/reservations`
- **Görev:** Kullanıcının seçtiği seferin koltuk düzenini görüntülemesi ve istediği koltuğu geçici olarak rezerve etmesi işlemleri.
- **UI Bileşenleri:**
  - Responsive otobüs/uçak oturma düzeni gridi.
  - Koltuk durum göstergeleri (Boş, Dolu, Seçili, Rezerve).
  - Cinsiyet seçim modalı (Erkek/Kadın seçimi).
  - "Sefer Özeti" kartı (Fiyat ve koltuk bilgileri).
  - "Ödemeye İlerle" aksiyon butonu.
- **Form Validasyonu:**
  - En fazla 5 koltuk seçimi sınırı.
  - Cinsiyet seçilmeden koltuk ekleme engeli.
  - Oturum açmamış kullanıcıların giriş sayfasına yönlendirilmesi.
- **Kullanıcı Deneyimi:**
  - Koltuk tıklandığında anlık görsel geri bildirim.
  - Seçilen koltukların özet panelinde dinamik olarak listelenmesi.
  - Rezervasyon işlemi sırasında loading spinner gösterimi.
- **Teknik Detaylar:**
  - React State Management ile koltuk seçim takibi.
  - POST isteği ile rezervasyonun backend tarafında kilitlenmesi.

## 2. Güvenli Ödeme (Checkout) Sayfası
- **API Endpoint:** `POST /api/tickets`, `DELETE /api/reservations/{id}`
- **Görev:** Rezerve edilen koltuklar için yolcu bilgilerinin alınması, ödemenin yapılması ve rezervasyonun iptal edilebilmesi süreci.
- **UI Bileşenleri:**
  - 10 dakikalık işlem zamanlayıcısı (Countdown Timer).
  - Kişi başı ayrı yolcu bilgi formu (Ad, Soyad, TCKN, İletişim).
  - Kredi kartı giriş alanı (Kart No, SKT, CVV).
  - "Ödemeyi Tamamla" ve "İptal Et ve Geri Dön" butonları.
- **Form Validasyonu:**
  - TCKN 11 hane sayısal kontrolü.
  - Telefon numarası format doğrulaması.
  - Kart numarası 16 hane maskeleme ve kontrolü.
- **Kullanıcı Deneyimi:**
  - Kart numarası girilirken otomatik formatlama (Masking).
  - Zamanlayıcı bitiminde bilet alımının durdurulması ve uyarı mesajı.
  - İptal butonuna basıldığında koltukların boşa çıkartılması ve geri yönlendirme.
- **Teknik Detaylar:**
  - Multi-passenger form state yönetimi.
  - Interval ile geri sayım mekanizması.
  - API POST ve DELETE entegrasyonu.

## 3. Seyahatlerim Sayfası
- **API Endpoint:** `DELETE /api/tickets/{id}`, `PUT /api/tickets/{id}/passenger`
- **Görev:** Kullanıcının satın aldığı biletleri listelemesi, yolcu bilgilerini güncellemesi ve biletini iptal etmesi işlemleri.
- **UI Bileşenleri:**
  - Aktif ve geçmiş bilet kartları (Rota, Saat, QR Kod).
  - "Bileti İptal Et" butonu (Confirm dialoglu).
  - "Bilgileri Güncelle" formu (TCKN/İsim düzenleme).
- **Form Validasyonu:**
  - Yolcu bilgisi güncellemede boş alan ve format kontrolü.
- **Kullanıcı Deneyimi:**
  - Biletlerin durumuna göre (iptal, onaylı, geçti) görsel ayırt edicilik.
  - İptal sonrası listenin anlık güncellenmesi.
  - Veri yüklenirken skeleton loader kullanımı.
- **Teknik Detaylar:**
  - DELETE /api/tickets ve PUT /api/tickets/{id}/passenger entegrasyonu.
  - Client-side data filtering (Gelecek/Geçmiş seyahat ayrımı).

## 4. Profil Ayarları Sayfası
- **API Endpoint:** `GET /api/users/profile`, `PUT /api/users/profile`, `DELETE /api/users/profile`
- **Görev:** Kullanıcının kişisel bilgilerini yönetmesi, güncellemesi ve hesabını tamamen silmesi süreci.
- **UI Bileşenleri:**
  - Profil bilgi kartı (Avatar ve temel bilgiler).
  - Düzenleme formu (Ad, Soyad, Telefon).
  - "Hesabımı Kalıcı Olarak Sil" butonu.
- **Form Validasyonu:**
  - Telefon format maskesi ve zorunlu alan kontrolü.
- **Kullanıcı Deneyimi:**
  - Başarılı güncelleme sonrası toast mesajı.
  - Hesap silme öncesi çift onay penceresi.
  - Silme sonrası otomatik logout ve redirect.
- **Teknik Detaylar:**
  - AuthContext üzerindeki kullanıcı verisinin senkronizasyonu.
  - API PUT ve DELETE istekleri.
  - LocalStorage / Token temizliği.

## 5. Admin - Yeni Sefer Ekleme Sayfası
- **API Endpoint:** `POST /api/admin/trips`
- **Görev:** Yetkili adminlerin platforma yeni otobüs veya uçak seferi tanımlaması için kullanılan arayüz.
- **UI Bileşenleri:**
  - Searchable dropdownlar (Kalkış-Varış lokasyon seçimi).
  - Tarih, Saat ve Varış Zamanı seçiciler.
  - Araç türü ve koltuk düzeni (2+1 / 2+2) ayarları.
  - Fiyat inputu ve "Sefer Oluştur" butonu.
- **Form Validasyonu:**
  - Geçmiş tarihli sefer girişinin engellenmesi.
  - Kalkış ve varışın aynı yer olamaması.
- **Kullanıcı Deneyimi:**
  - Şehir arama özelliği ile hızlı seçim.
  - Başarılı ekleme sonrası formun sıfırlanması ve başarı bildirimi.
- **Teknik Detaylar:**
  - Admin yetki doğrulaması (Protected routes).
  - ISO string tarih dönüşümleri.

## 6. Admin - Sefer Düzenleme Sayfası
- **API Endpoint:** `PUT /api/admin/trips/{id}`, `DELETE /api/admin/trips/{id}`
- **Görev:** Mevcut bir seferin bilgilerinin güncellenmesi veya seferin tamamen silinmesi.
- **UI Bileşenleri:**
  - Mevcut verilerle önceden doldurulmuş düzenleme formu.
  - "Değişiklikleri Kaydet" ve "Seferi Sil" butonları.
- **Kullanıcı Deneyimi:**
  - Verilerin formda hazır gelmesi sayesinde hızlı düzenleme.
  - Sefer silme öncesi kritik işlem uyarısı.
- **Teknik Detaylar:**
  - URL'den ID parametresi yakalama (GET + PUT/DELETE akışı).
  - Form dirty state takibi.