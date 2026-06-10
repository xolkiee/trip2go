# Furkan Burak Öztürk'ün Mobil Backend Entegrasyon Görevleri
**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** (Video Linki Buraya Eklenecek)



## 1. Rezervasyon (Koltuk Ayırma ve İptal) Servisi
- **API Endpoints:** 
  - `POST /api/reservations` (Koltuk Rezerve Etme)
  - `DELETE /api/reservations/{id}` (Rezervasyon İptali)
- **Görev:** Kullanıcının seçtiği koltukları geçici olarak ayırtması ve süre bitiminde veya kendi isteğiyle bu işlemi iptal etmesi süreçlerinin yönetilmesi.
- **İşlevler:**
  - Seçilen koltukların halihazırda dolu olup olmadığının (occupied/reserved) eşzamanlı olarak kontrol edilmesi.
  - Otobüs seferleri için kadın/erkek yan yana oturma kısıtlamalarının sunucu tarafında (Server-side) doğrulanması.
  - İptal isteği geldiğinde geçici olarak kapatılan koltuğun statüsünün tekrar `available` (boş) olarak güncellenmesi.
- **Teknik Detaylar:**
  - Hata durumlarını yakalama (400 Bad Request, Koltuk Dolu Hatası).
  - JWT tabanlı yetki kontrolü ile Admin hesaplarının rezervasyon işlemlerinin API seviyesinde engellenmesi.



## 2. Bilet Satın Alma ve İptal Servisi
- **API Endpoints:** 
  - `POST /api/tickets` (Bilet Satın Alma)
  - `DELETE /api/tickets/{id}` (Bilet İptal Etme)
- **Görev:** Ödeme adımı sonrası biletin kesinleşmesi ve sonradan yapılacak iptal işlemlerinin veritabanına yansıtılması.
- **İşlevler:**
  - Kesinleşen biletler için `tickets` koleksiyonunda kalıcı doküman oluşturulması ve seferdeki koltuk statüsünün `occupied` yapılması.
  - İptal durumunda bilet statüsünün "cancelled" olarak işaretlenmesi.
  - İptal edilen biletin bağlı olduğu `trips` koleksiyonundaki ilgili koltuğun statüsünün "available" yapılarak tekrar satışa açılması.
- **Teknik Detaylar:**
  - İptal işlemlerinde çift yönlü veritabanı güncellemesi (Cascade update).
  - Yalnızca biletin asıl sahibi olan kullanıcının iptal işlemi yapabilmesi (Ownership check).



## 3. Yolcu Bilgileri Güncelleme Servisi
- **API Endpoint:** `PUT /api/tickets/{id}/passenger`
- **Görev:** Önceden satın alınmış bir bilet üzerindeki yolcu kişisel verilerinin güncellenmesi.
- **İşlevler:**
  - Yolcunun TC Kimlik No, Pasaport No, Ad, Soyad ve Doğum Tarihi gibi verilerinin yeni girilen değerlerle değiştirilmesi.
  - `tickets` şeması içindeki gömülü (embedded) yolcu objesinin güncellenmesi.
- **Teknik Detaylar:**
  - Güncelleme sırasında veri validasyon kurallarının işletilmesi.
  - Mülkiyet (Ownership) ve JWT Bearer doğrulaması.



## 4. Sistem Yöneticisi (Admin) Sefer Yönetim Servisi
- **API Endpoints:** 
  - `POST /api/admin/trips` (Sisteme Yeni Sefer Ekleme)
  - `PUT /api/admin/trips/{id}` (Sefer Bilgisini Güncelleme)
  - `DELETE /api/admin/trips/{id}` (Sefer Silme)
- **Görev:** Yönetici yetkisine sahip hesapların, kendi şirketleri adına platforma yeni otobüs veya uçak seferleri eklemesi, var olanları düzenlemesi veya silmesi.
- **İşlevler:**
  - Seferlerin kalkış, varış, fiyat, tarih, saat, varış saati ve koltuk dizilimi (2+1, 2+2, 3+3) gibi detaylarının şemaya işlenmesi.
  - Silme işlemi yapıldığında o sefere ait bilgilerin veritabanından tamamen temizlenmesi.
- **Teknik Detaylar:**
  - Mongoose yetki middleware'i ile `role: 'admin'` kontrolü yapılması.
  - Admin şirket adının ve taşıt tipinin (bus/flight) token'dan okunarak `company` ve `type` alanlarına sunucu tarafında otomatik atanması (güvenlik için).



## 5. Kullanıcı Profili ve Hesap Yönetimi Servisi
- **API Endpoints:**
  - `GET /api/users/profile` (Profil Bilgilerini Getirme)
  - `PUT /api/users/profile` (Profil Bilgilerini Güncelleme)
  - `DELETE /api/users/profile` (Hesap Silme)
- **Görev:** Kullanıcıların temel hesap verilerini, aktif ve geçmiş biletlerini çekmesi, hesap bilgilerini veya şifresini güncellemesi ve hesabını tamamen kapatması.
- **İşlevler:**
  - Kullanıcının "Aktif" biletlerini tespit edip UI tarafına sunma (Hesap silme güvenliği için).
  - Şifre sıfırlama taleplerinde eski verinin üzerine güvenli (hashing) yazma.
  - Hesap silindiğinde kullanıcıya ait verilerin KVKK/GDPR süreçlerine uygun şekilde anonimleştirilmesi veya silinmesi.



## 6. Konum (Location) ve Veri Tohumlama (Seeding) Servisi
- **API Endpoint:** `GET /api/locations`
- **Görev:** Mobil uygulamanın arama ve sefer ekleme ekranlarını besleyen Türkiye havalimanı ve il/ilçe verilerinin dinamik olarak sunulması.
- **İşlevler:**
  - Veritabanı boşsa (ilk kurulumda) dışarıdan bir API'ye (`turkiyeapi.dev`) bağlanıp Türkiye'nin 81 il ve ilçesini MongoDB'ye `city` tipiyle kaydetme.
  - Sistemde önceden tanımlanmış büyük havalimanı verilerini veritabanına `airport` tipiyle otomatik enjekte etme (Seeding).
  - İstemci tarafına lokasyonların alfabetik sırayla dönülmesi.
- **Teknik Detaylar:**
  - Mongoose `insertMany` ile dış kaynaktan gelen yüzlerce verinin Atlas veritabanını yormadan topluca (batch) eklenmesi.
  - DB kontrolünün milisaniyeler içinde asenkron yapılarak sadece ihtiyaç halinde tohumlama işleminin başlatılması (Timeout ve performans optimizasyonu).
