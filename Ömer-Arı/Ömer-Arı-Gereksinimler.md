1. **Kullanıcı Kaydı** (Ömer Arı)
   
   **API Metodu:** `POST /api/auth/register`
   
   **Açıklama:** Sisteme yeni bir kullanıcının kayıt olmasını sağlar. İsim, e-posta, şifre gibi temel bilgiler alınarak veritabanında yeni bir yolcu profili oluşturulur.

2. **Kullanıcı Girişi** (Ömer Arı)
   
   **API Metodu:** `POST /api/auth/login`
   
   **Açıklama:** Kayıtlı kullanıcıların e-posta ve şifreleriyle sisteme giriş yapmasını sağlar. Başarılı giriş sonrası oturum yönetimi için kullanıcıya erişim yetkisi (token) verilir.

3. **Şifremi Unuttum** (Ömer Arı)
   
   **API Metodu:** `POST /api/auth/forgot-password`, `PUT /api/auth/reset-password`
   
   **Açıklama:** Şifresini unutan kullanıcıların e-posta adreslerine sıfırlama bağlantısı gönderilmesini (POST) ve ardından güvenli bir şekilde yeni şifre belirleme işlemini (PUT) kapsar.

4. **Şehir/Havalimanı Listesini Getirme** (Ömer Arı)
    
    **API Metodu:** `GET /api/locations`
    
    **Açıklama:** Kullanıcıların arama yaparken seçeceği kalkış ve varış noktalarının (otogarlar, şehirler ve havalimanları) listelenmesini ve otomatik tamamlama için sunulmasını sağlar.

5. **Seferleri Arama** (Ömer Arı)
    
    **API Metodu:** `GET /api/trips/search`
    
    **Açıklama:** Kullanıcıların belirlediği tarih, güzergah (kalkış-varış) kriterlerine uygun olan aktif otobüs ve uçak seferlerinin filtrelenerek listelenmesini sağlar.

6. **Sefer Detayı ve Koltuk Durumu Getirme** (Ömer Arı)
    
    **API Metodu:** `GET /api/trips/{id}/details`
    
    **Açıklama:** Belirli bir seferin seçilmesi durumunda, o aracın/uçağın oturma düzenini, dolu ve boş koltukların anlık durumunu sisteme getirir.

7. **Firma/Sefer Değerlendirmesi Ekleme** (Ömer Arı)
    
    **API Metodu:** `POST /api/reviews`
    
    **Açıklama:** Bilet alıp yolculuğunu tamamlamış kullanıcıların, ilgili seyahat firması veya spesifik sefer hakkında puanlama yapmasını ve yorum yazmasını sağlar.

8. **Firma/Sefer Yorumlarını Listeleme** (Ömer Arı)
    
    **API Metodu:** `GET /api/reviews/trip/{id}`
    
    **Açıklama:** Bir seferi satın almak isteyen kullanıcıların, ilgili firma veya güzergah için daha önce yapılmış olan değerlendirmeleri ve puan ortalamalarını okumasını sağlar.

9. **Kullanıcının Kendi Yorumunu Düzenlemesi** (Ömer Arı)
    
    **API Metodu:** `PUT /api/reviews/{id}`
    
    **Açıklama:** Kullanıcının daha önceden yapmış olduğu bir değerlendirme metnini veya verdiği puanı sonradan değiştirmesine olanak tanır.

10. **Kullanıcının Yorumunu Silmesi** (Ömer Arı)
    
    **API Metodu:** `DELETE /api/reviews/{id}`
    
    **Açıklama:** Kullanıcının sistemde görünmesini istemediği, kendisine ait eski bir firma/sefer yorumunu kalıcı olarak kaldırmasını sağlar.
