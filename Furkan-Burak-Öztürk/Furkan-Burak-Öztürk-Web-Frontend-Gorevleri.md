# Furkan Burak Öztürk'ün Web Frontend Görevleri

**Front-end Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Sefer Detay Sayfası (`TripDetails.jsx`)
- **API Endpoint:** `POST /api/reservations`, `GET /api/trips/{id}/details`
- **Görev:** Kullanıcının seçtiği seferin interaktif koltuk şemasını görüntülemesi ve koltuk seçerek 10 dakikalık geçici rezervasyon (kilit) oluşturması.
- **UI Bileşenleri:**
  - Responsive araç (otobüs/uçak) koltuk gridi.
  - Dinamik koltuk durumları (Boş, Dolu, Seçili, Rezerve).
  - Cinsiyet seçim modalı (Mavi/Pembe renk kodlaması).
  - Canlı sepet özeti ve fiyat hesaplama kartı.
  - "Ödemeye İlerle" aksiyon butonu.
- **Form Validasyonu:**
  - Tek seferde en fazla **5 koltuk** seçimi sınırı.
  - Cinsiyet seçimi yapılmadan koltuk eklenememesi.
  - Admin hesaplarının bilet alımının engellenmesi.
- **Teknik Detaylar:**
  - `selectedSeats` state'i ile çoklu seçim yönetimi.
  - Token kontrolü ile misafir kullanıcıların `/login` sayfasına yönlendirilmesi.

## 2. Güvenli Ödeme (Checkout) Sayfası (`Checkout.jsx`)
- **API Endpoint:** `POST /api/tickets`, `DELETE /api/reservations/{id}`
- **Görev:** Rezerve edilen koltuklar için yolcu bilgilerinin toplanması, kredi kartı simülasyonu ve ödemenin tamamlanması.
- **UI Bileşenleri:**
  - **10 Dakikalık Geri Sayım Sayacı (Timer):** Süre bitince işlemi durdurma.
  - Dinamik yolcu formları (Seçilen koltuk sayısı kadar form render edilir).
  - Kart numarası ve telefon numarası için giriş maskeleri (Input masking).
  - "Ödemeyi Tamamla" ve "İptal Et / Geri Dön" butonları.
- **Form Validasyonu:**
  - TCKN alanı için **11 hane** ve sayısal kontrolü.
  - Telefon numarası için karakter uzunluğu ve format kontrolü (05xx...).
  - Kredi kartı için **16 hane** ve son kullanma tarihi geçerlilik kontrolü.
- **Teknik Detaylar:**
  - `setInterval` ile senkronize çalışan countdown mekanizması.
  - Rezervasyonun kullanıcı tarafından manuel iptali (DELETE).

## 3. Seyahatlerim Sayfası (`MyTrips.jsx`)
- **API Endpoint:** `DELETE /api/tickets/{id}`, `PUT /api/tickets/{id}/passenger`
- **Görev:** Kullanıcının satın aldığı aktif ve geçmiş biletlerini listelediği, biletlerini yönetebildiği panel.
- **UI Bileşenleri:**
  - Bilet kartları (Firma logosu, Rota, Şehirler, Kalkış Saati).
  - Durum etiketleri (Sefer Bekleniyor, Tamamlandı, İptal Edildi).
  - Satır içi (Inline) yolcu bilgisi güncelleme formu.
  - "Bileti İptal Et" onay penceresi (Confirm dialog).
- **Teknik Detaylar:**
  - Tarih bazlı veri filtreleme (Gelecek ve Geçmiş seyahat ayrımı).
  - `fetchTickets` ile bilet listesinin asenkron yüklenmesi ve yenilenmesi.

## 4. Profil Ayarları Sayfası (`Profile.jsx`)
- **API Endpoint:** `GET /api/users/profile`, `PUT /api/users/profile`, `DELETE /api/users/profile`
- **Görev:** Kullanıcının kişisel bilgilerini yönetmesi, şifresini değiştirmesi ve hesabını tamamen silmesi.
- **UI Bileşenleri:**
  - Profil Bilgileri Formu (Ad, Soyad, Email, Telefon).
  - Şifre güncelleme alanı.
  - "Hesabımı Kalıcı Olarak Sil" butonu ve kritik işlem uyarı kutusu (Danger zone).
- **Teknik Detaylar:**
  - `localStorage` üzerindeki kullanıcı verisinin her güncelleme sonrası yeni token ile senkronize edilmesi.
  - Hesap silme esnasında aktif biletlerin kontrolü ve kullanıcıya uyarı gösterimi.

## 5. Admin - Yeni Sefer Ekleme Sayfası (`AdminTripCreate.jsx`)
- **API Endpoint:** `POST /api/admin/trips`, `GET /api/locations`
- **Görev:** Adminlerin sisteme yeni otobüs veya uçak seferi tanımlaması.
- **UI Bileşenleri:**
  - `SearchableSelect`: Otomatik tamamlamalı şehir/havalimanı arama kutuları.
  - Tarih ve Saat seçiciler.
  - Fiyat ve araç kapasitesi giriş alanları.
  - Sefer Listesi Tablosu: Eklenen tüm seferlerin dökümü.
- **Teknik Detaylar:**
  - Admin login token'ı ile yetkilendirilmiş istekler.
  - Başarılı ekleme sonrası formun temizlenmesi ve listenin anlık güncellenmesi.

## 6. Admin - Sefer Düzenleme ve Silme (`AdminTripUpdate.jsx` & `AdminTripCreate.jsx`)
- **API Endpoint:** `PUT /api/admin/trips/{id}`, `DELETE /api/admin/trips/{id}`
- **Görev:** Mevcut bir seferin bilgilerinin güncellenmesi veya yayından kaldırılması.
- **UI Bileşenleri:**
  - Mevcut verilerle ön-doldurulmuş (Pre-filled) düzenleme formu.
  - Sefer Listesi Tablosu içindeki "Sil" ve "Düzenle" butonları.
- **Teknik Detaylar:**
  - URL'den ID yakalama (Params) ve o sefere özgü veriyi çekme.
  - `DELETE` isteği ile seferin tamamen veritabanından kaldırılması.