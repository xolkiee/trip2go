# Ömer Arı'nın Web Frontend Görevleri
**Front-end Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Ana Sayfa ve Sefer Arama
- **API Endpoint:** `GET /api/locations`, `GET /api/trips/search`
- **Görev:** Kullanıcının şehir veya havalimanı seçerek istediği tarihteki otobüs/uçak seferlerini aradığı ve listeleyebildiği arayüzün tasarımı.
- **UI Bileşenleri:**
  - Kalkış ve varış noktaları için otomatik tamamlamalı (autocomplete) arama kutuları.
  - Sefer tarihi için interaktif DatePicker (Takvim).
  - "Otobüs" ve "Uçak" sekmeleri (Tab menu).
  - "Seferleri Bul" aksiyon butonu.
  - Arama sonuçlarını listeleyen yatay sefer kartları (Firma logoları, kalkış/varış saatleri, yol süresi, fiyat).
- **Form Validasyonu:**
  - Kalkış ve varış noktalarının birbiriyle aynı seçilememesi.
  - Geçmiş tarihli arama yapılmasının sistem tarafından engellenmesi.
  - Lokasyonlar ve tarih girilmeden arama butonunun inaktif (disabled) olması.
- **Kullanıcı Deneyimi:**
  - Şehir ararken hızlı filtreleme ve liste yüklenirken "Yükleniyor..." gösterimleri.
  - Aranan kriterde sefer bulunamazsa tasarımsal olarak zengin bir "Sefer Bulunamadı (Empty State)" ekranı.
  - Yükleme sırasında skeleton animasyonlarının kullanımı.
- **Teknik Detaylar:**
  - Anasayfa yüklendiğinde `/api/locations` endpoint'i üzerinden illerin ve durakların çekilip state'e aktarılması.
  - Kullanıcı filtreleri ile query parametreleri oluşturulup `/api/trips/search` isteğinin atılması.

## 2. Kimlik Doğrulama: Giriş Yap ve Kayıt Ol Sayfaları
- **API Endpoint:** `POST /api/auth/login`, `POST /api/auth/register`
- **Görev:** Kullanıcıların yeni hesap oluşturabildiği ve sisteme giriş yapabildiği güvenli Auth formları.
- **UI Bileşenleri:**
  - İç içe veya ayrı sayfalarda iki temel form (Login / Register).
  - Email ve Şifre inputları, ayrıca Kayıt Olma bölümünde Ad ve Soyad inputları.
  - Şifre görünürlüğünü aç/kapat butonu (Göz ikonu).
  - Formun altında "Hesabın yok mu? Kayıt Ol" veya "Şifremi Unuttum" yönlendirme linkleri.
  - Loading spinner içeren primary gönderim butonları.
- **Form Validasyonu:**
  - Email girdi formatının standartlara (Regex) uygunluğu kontrolü.
  - Şifrenin en az belli bir uzunlukta olması kuralı.
  - Boş bırakılan alanlarda canlı (real-time) hataların gösterilmesi.
- **Kullanıcı Deneyimi:**
  - Hatalı şifre veya kayıt durumlarında formda sarsılma efekti (shake) veya input altında kırmızı, okunaklı "Geçersiz E-posta" mesajları.
  - Başarılı kayıttan sonra kullanıcının pürüzsüzce "Giriş Yap" ekranına geçirilmesi veya anasayfaya otomatize yönlendirilmesi.
- **Teknik Detaylar:**
  - Giriş sonrası dönen JWT Token'in `localStorage` içerisine kaydedilmesi.
  - React.Context yapısıyla Global state üzerinde kullanıcının `isLoggedIn = true` yapılması ve header güncellemeleri.

## 3. Şifremi Unuttum ve Sıfırlama Sayfaları
- **API Endpoint:** `POST /api/auth/forgot-password`, `PUT /api/auth/reset-password`
- **Görev:** Şifresini unutan kullanıcılar için güvenli şifre sıfırlama akışının 2 sayfalı ekran serüveni.
- **UI Bileşenleri:**
  - "Şifremi Unuttum" ilk aşama formu (Sadece e-posta istenir).
  - "Yeni Şifrenizi Belirleyin" ekranı (Yeni şifre ve şifre onayı inputları).
- **Form Validasyonu:**
  - Yeni girilen ve tekrar girilen şifrenin birebir aynı olması gerektiği eşleşme kontrolü.
- **Kullanıcı Deneyimi:**
  - Mail başarıyla atıldığında "Mail kutunuzu kontrol edin" diyerek sürecin yeşil bildirim ile sonlandırılması.
  - Şifre sıfırlama linki geçersizse arayüzde bir uyarı verilip, başa (şifremi unuttum ekranı) döndürme butonu çıkarılması.
- **Teknik Detaylar:**
  - Backend'in kabul edeceği Reset JWT Token'ının url routing üzerinden (örn: `/reset-password/:token`) alınıp PUT isteğine bağlanması.

## 4. Sefer İnceleme ve Yorumlar Alanı
- **API Endpoint:** `GET /api/trips/{id}/details`, `GET /api/reviews/trip/{id}`
- **Görev:** Kullanıcının ilgilendiği seferi özel olarak incelemesi ve diğer yolcuların yaptığı firma değerlendirmelerini listeleyebilmesi.
- **UI Bileşenleri:**
  - Seferin taşıt detayı bilgileri (Koltuk haritası getirme kısmı).
  - Firmanın genel puanını gösteren özet bir yıldız reytingi tablosu (Örn: 4.8 / 5 Yıldız).
  - Scroll edilebilir kullanıcı yorumları arayüzü (İsim maskeleme: Y*** S***, Tarih ve Yorum metni).
- **Kullanıcı Deneyimi:**
  - Yorum alanında "Bu firma/sefer için ilk yorumu sen yap!" gibi boş durum (empty state) yönlendirmeleri.
  - Uzun yorumlar için "...daha fazla oku" genişletilebilir açılır metin deneyimi.
- **Teknik Detaylar:**
  - Sayfa mount edildiğinde asenkron olarak hem detay hem de o sefere ait spesifik yorumların `/api/reviews/trip/{id}` isteğiyle sayfa state'inde birleştirilmesi.

## 5. Kullanıcının Yorum Yönetmesi (Ekle/Düzenle/Sil)
- **API Endpoint:** `POST /api/reviews`, `PUT /api/reviews/{id}`, `DELETE /api/reviews/{id}`
- **Görev:** Bilet aldığı sefer için yorum yazmak isteyen, yazdığı yorumu düzenlemek ya da sistemden tamamen kaldırmak isteyen yolcu için form alanları.
- **UI Bileşenleri:**
  - Değerlendirme eklemek veya düzenlemek için ayrılmış bir Modal veya Genişleyebilir (Accordion) div.
  - Mouse ile hoverlandığında altın sarısı rengine bürünen 1-5 arası interaktif yıldızlar.
  - Yorum metni için `textarea`.
  - İşlem butonları ("Gönder", "Değişiklikleri Kaydet", "Yorumumu Sil").
- **Form Validasyonu:**
  - Yıldız puanı verilmeden yorum göndermeye izin verilmemesi (Disable button).
  - Herhangi bir değişiklik yapılmadıysa "Kaydet" butonunun pasif bekletilmesi.
- **Kullanıcı Deneyimi:**
  - Kendi yorumunu silmek istediğinde, "Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?" güvenlik zırhı (Confirm).
  - Yorum onaylandığında "Değerlendirmeniz alındı" uyarısı (Toast) gösterimi ve modalın kendiliğinden kaybolması.
- **Teknik Detaylar:**
  - Token tabanlı Bearer yetkilendirmesi ile işlem yapılması.
  - Düzenleme yapılıyorsa `PUT`, siliniyorsa `DELETE` endpoint'lerine dinamik method akışı ve istek sonrasında listenin fetch ya da client bazlı yenilenmesi (Optimistic Update).
