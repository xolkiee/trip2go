# Gereksinim Analizi
# Tüm Gereksinimler 

1. **Kullanıcı Kaydı** (Ömer Arı)
   
   **API Metodu:** `POST /api/auth/register`
   
   **Açıklama:** Sisteme yeni bir kullanıcının kayıt olmasını sağlar. İsim, e-posta, şifre gibi temel bilgiler alınarak veritabanında yeni bir yolcu profili oluşturulur.

2. **Kullanıcı Girişi** (Ömer Arı)
   
   **API Metodu:** `POST /api/auth/login`
   
   **Açıklama:** Kayıtlı kullanıcıların e-posta ve şifreleriyle sisteme giriş yapmasını sağlar. Başarılı giriş sonrası oturum yönetimi için kullanıcıya erişim yetkisi (token) verilir.

3. **Şifremi Unuttum** (Ömer Arı)
   
   **API Metodu:** `POST /api/auth/forgot-password`, `PUT /api/auth/reset-password`
   
   **Açıklama:** Şifresini unutan kullanıcıların e-posta adreslerine sıfırlama bağlantısı gönderilmesini (POST) ve ardından güvenli bir şekilde yeni şifre belirleme işlemini (PUT) kapsar.

4. **Koltuk Rezerve Etme** (Furkan Burak Öztürk)
   
   **API Metodu:** `POST /api/reservations`
   
   **Açıklama:** Kullanıcıların seçtikleri bir uçuş veya otobüs seferi için belirli bir koltuğu geçici süreliğine ayırtmasını sağlar.

5. **Rezervasyon İptali** (Furkan Burak Öztürk)
   
   **API Metodu:** `DELETE /api/reservations/{id}`
   
   **Açıklama:** Kullanıcının daha önceden yapmış olduğu geçici koltuk rezervasyonunu iptal etmesini ve o koltuğun diğer yolcular için tekrar boşa çıkmasını sağlar.

6. **Bilet Satın Alma** (Furkan Burak Öztürk)
   
   **API Metodu:** `POST /api/tickets`
   
   **Açıklama:** Seçilen sefer ve koltuk için ödeme adımlarının tamamlanarak biletin kalıcı olarak onaylanmasını ve kullanıcı adına oluşturulmasını sağlar.

7. **Bilet İptal Etme** (Furkan Burak Öztürk)
   
   **API Metodu:** `DELETE /api/tickets/{id}`
   
   **Açıklama:** Satın alınmış olan kesinleşmiş bir biletin iptal edilmesini ve kurallara bağlı olarak iade süreçlerinin başlatılmasını sağlar.

8. **Yolcu Bilgilerini Güncelleme** (Furkan Burak Öztürk)
   
   **API Metodu:** `PUT /api/tickets/{id}/passenger`
   
   **Açıklama:** Bilet satın alınan yolcunun sisteme girilen kimlik (TCKN/Pasaport vb.), isim veya iletişim bilgilerinin sonradan düzenlenmesini sağlar.

9. **Sisteme Yeni Sefer Ekleme (Admin)** (Furkan Burak Öztürk)
   
   **API Metodu:** `POST /api/admin/trips`
   
   **Açıklama:** Sistem yöneticilerinin (admin) platforma yeni uçak veya otobüs seferleri eklemesini sağlar. Kalkış-varış noktaları, saat, fiyat ve araç kapasitesi gibi verileri içerir.

10. **Sefer Bilgisini Güncelleme (Admin)** (Furkan Burak Öztürk) 
    
    **API Metodu:** `PUT /api/admin/trips/{id}`
    
    **Açıklama:** Sistem yöneticilerinin mevcut bir seferin gecikme durumu, saati, fiyatı veya araç/uçak tipi gibi detaylarında değişiklik yapmasını sağlar.

11. **Profil Sekmesi** (Furkan Burak Öztürk)
    
    **API Metodu:** `GET /api/users/profile`
    
    **Açıklama:** Kullanıcının kendi hesap bilgilerine erişmesini sağlar. Geçmiş biletler, yaklaşan seferler ve temel kullanıcı bilgileri listelenir.

12. **Profil Bilgilerini Güncelleme** (Furkan Burak Öztürk)
    
    **API Metodu:** `PUT /api/users/profile`
    
    **Açıklama:** Kullanıcının ad, soyad, telefon numarası gibi kişisel profil verilerini ve tercihlerini değiştirmesine olanak tanır.

13. **Hesap Silme** (Furkan Burak Öztürk)
    
    **API Metodu:** `DELETE /api/users/profile`
    
    **Açıklama:** Kullanıcının sistemdeki hesabını tamamen kapatmasını ve kişisel verilerinin KVKK/GDPR süreçlerine uygun olarak silinmesini sağlar.

14. **Şehir/Havalimanı Listesini Getirme** (Ömer Arı)
    
    **API Metodu:** `GET /api/locations`
    
    **Açıklama:** Kullanıcıların arama yaparken seçeceği kalkış ve varış noktalarının (otogarlar, şehirler ve havalimanları) listelenmesini ve otomatik tamamlama için sunulmasını sağlar.

15. **Seferleri Arama** (Ömer Arı)
    
    **API Metodu:** `GET /api/trips/search`
    
    **Açıklama:** Kullanıcıların belirlediği tarih, güzergah (kalkış-varış) kriterlerine uygun olan aktif otobüs ve uçak seferlerinin filtrelenerek listelenmesini sağlar.

16. **Sefer Detayı ve Koltuk Durumu Getirme** (Ömer Arı)
    
    **API Metodu:** `GET /api/trips/{id}/details`
    
    **Açıklama:** Belirli bir seferin seçilmesi durumunda, o aracın/uçağın oturma düzenini, dolu ve boş koltukların anlık durumunu sisteme getirir.

17. **Firma/Sefer Değerlendirmesi Ekleme** (Ömer Arı)
    
    **API Metodu:** `POST /api/reviews`
    
    **Açıklama:** Bilet alıp yolculuğunu tamamlamış kullanıcıların, ilgili seyahat firması veya spesifik sefer hakkında puanlama yapmasını ve yorum yazmasını sağlar.

18. **Firma/Sefer Yorumlarını Listeleme** (Ömer Arı)
    
    **API Metodu:** `GET /api/reviews/trip/{id}`
    
    **Açıklama:** Bir seferi satın almak isteyen kullanıcıların, ilgili firma veya güzergah için daha önce yapılmış olan değerlendirmeleri ve puan ortalamalarını okumasını sağlar.

19. **Kullanıcının Kendi Yorumunu Düzenlemesi** (Ömer Arı)
    
    **API Metodu:** `PUT /api/reviews/{id}`
    
    **Açıklama:** Kullanıcının daha önceden yapmış olduğu bir değerlendirme metnini veya verdiği puanı sonradan değiştirmesine olanak tanır.

20. **Kullanıcının Yorumunu Silmesi** (Ömer Arı)
    
    **API Metodu:** `DELETE /api/reviews/{id}`
    
    **Açıklama:** Kullanıcının sistemde görünmesini istemediği, kendisine ait eski bir firma/sefer yorumunu kalıcı olarak kaldırmasını sağlar.

# Gereksinim Dağılımları

1. [Furkan Burak Öztürk'ün Gereksinimleri](Furkan-Burak-Öztürk/Furkan-Burak-Öztürk-Gereksinimler.md)
2. [...'nın Gereksinimleri](Grup-Uyesi-2/Grup-Uyesi-2-Gereksinimler.md)