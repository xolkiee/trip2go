# Furkan Burak Öztürk'ün Mobil Frontend Görevleri
**Mobile Front-end Demo Videosu:** (Video Linki Buraya Eklenecek)



## 1. Bilet Alım ve Rezervasyon Akışı
- **API Endpoints:** 
  - `POST /api/reservations` (Koltuk Rezerve Etme)
  - `DELETE /api/reservations/{id}` (Rezervasyon İptali)
  - `POST /api/tickets` (Bilet Satın Alma)
- **Görev:** Kullanıcının seçtiği uçak veya otobüs seferi için koltuk seçimi yapmasını, seçtiği koltuğu geçici olarak rezerve edip ardından ödeme adımlarına (checkout) geçerek biletini satın almasını sağlayan arayüzlerin geliştirilmesi.
- **UI Bileşenleri:**
  - İnteraktif Koltuk Seçim Ekranı (Uçak için 3+3, Otobüs için 2+1 ve 2+2 dinamik koltuk düzenleri).
  - Seçilen koltukların detayları, sepet tutarı ve ödemeye ilerle butonu.
  - Dolu koltuklar ve cinsiyet belirtimi için Legend (Gösterge) alanı.
- **Teknik Detaylar:**
  - Kullanıcı yetki kontrolü (Yöneticilerin/Adminlerin bilet alımının arayüzde engellenmesi ve hata mesajı gösterimi).
  - Otobüs seferleri için cinsiyet kısıtlamalarına göre yan yana oturma kurallarının validasyonu.



## 2. Seyahatlerim ve Bilet Yönetimi (İptal ve Güncelleme)
- **API Endpoints:**
  - `DELETE /api/tickets/{id}` (Bilet İptal Etme)
  - `PUT /api/tickets/{id}/passenger` (Yolcu Bilgilerini Güncelleme)
- **Görev:** Kullanıcıların satın almış oldukları aktif biletleri görüntüleyebilmesi, yaklaşan seyahatleri listelemesi, seçili biletlerini iptal etmesi ve biletteki yolcu bilgilerini güncellemesi için gerekli arayüzlerin oluşturulması.
- **UI Bileşenleri:**
  - "Seyahatlerim" (My Trips) sekmesinde aktif biletlerin listelendiği özel bilet kartları.
  - Açılır modal şeklinde yolcu bilgi güncelleme formu (Ad, soyad, TC Kimlik/Pasaport No, Doğum Tarihi).
  - Bilet iptal işlemi için kırmızı uyarı renkleriyle tasarlanmış onay (Confirmation) diyaloğu.
- **Kullanıcı Deneyimi:**
  - İptal edilen biletlerin anında sistemden silinerek sayfanın yenilenmesi (Dinamik state yönetimi).



## 3. Sistem Yöneticisi (Admin) Sefer Yönetim Paneli
- **API Endpoints:**
  - `POST /api/admin/trips` (Sisteme Yeni Sefer Ekleme)
  - `PUT /api/admin/trips/{id}` (Sefer Bilgisini Güncelleme)
  - `DELETE /api/admin/trips/{id}` (Sefer Silme)
- **Görev:** Admin yetkisine sahip kullanıcıların mobil uygulamaya girdiklerinde standart kullanıcılardan farklı olarak gördükleri, kendi firmalarına ait seferleri yönetebildikleri "Sefer Yönetimi" sekmesinin tasarlanması ve geliştirilmesi.
- **UI Bileşenleri:**
  - Şirkete ait güncel seferlerin listelendiği yönetici paneli (Sefer detayları ve Koltuk Düzeni etiketi ile).
  - Akıllı Konum Seçici (Modal tabanlı canlı arama ile il/ilçe ve havalimanı seçimi).
  - Form formatında güvenli saat girişi sağlayan maskeli Time Input ve DatePicker seçicileri.
  - Sefer Ekle, Düzenle ve Sil eylem butonları.
- **Teknik Detaylar:**
  - Admin hesabının firma türüne göre (Otobüs veya Uçak) ilgili şehir (city) veya havalimanı (airport) konumlarının akıllı filtrelenerek sadece uygun olanların gösterilmesi.



## 4. Kullanıcı Profili ve Hesap Ayarları
- **API Endpoints:**
  - `GET /api/users/profile` (Profil Bilgilerini Getirme)
  - `PUT /api/users/profile` (Profil Bilgilerini Güncelleme)
  - `DELETE /api/users/profile` (Hesabı Kalıcı Silme)
- **Görev:** Kullanıcının (veya Adminin) kişisel profil ekranını görüntülemesi, bilgilerini & şifresini yenilemesi ve hesap silme/çıkış süreçlerini yönetmesi.
- **UI Bileşenleri:**
  - Profil bilgileri güncelleme formu ve "Yeni Şifre Belirle" alanı.
  - "Hesabı Kalıcı Olarak Sil" ve "Hesaptan Çıkış Yap" butonları.
- **Teknik Detaylar:**
  - Hesap silme işlemi öncesi kullanıcının "Aktif" (henüz gerçekleşmemiş) yaklaşan bileti olup olmadığının kontrol edilmesi ve varsa "Sildiğiniz takdirde biletleriniz yanar" şeklinde kritik uyarı verilmesi.
  - Token tabanlı oturum sonlandırma ve güvenli çıkış yönlendirmeleri.