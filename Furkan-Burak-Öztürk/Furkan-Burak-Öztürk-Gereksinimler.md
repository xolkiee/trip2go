1. **Koltuk Rezerve Etme**
   
   **API Metodu:** `POST /api/reservations`
   
   **Açıklama:** Kullanıcıların seçtikleri bir uçuş veya otobüs seferi için belirli bir koltuğu geçici süreliğine ayırtmasını sağlar.

2. **Rezervasyon İptali**
   
   **API Metodu:** `DELETE /api/reservations/{id}`
   
   **Açıklama:** Kullanıcının daha önceden yapmış olduğu geçici koltuk rezervasyonunu iptal etmesini ve o koltuğun diğer yolcular için tekrar boşa çıkmasını sağlar.

3. **Bilet Satın Alma**
   
   **API Metodu:** `POST /api/tickets`
   
   **Açıklama:** Seçilen sefer ve koltuk için ödeme adımlarının tamamlanarak biletin kalıcı olarak onaylanmasını ve kullanıcı adına oluşturulmasını sağlar.

4. **Bilet İptal Etme**
   
   **API Metodu:** `DELETE /api/tickets/{id}`
   
   **Açıklama:** Satın alınmış olan kesinleşmiş bir biletin iptal edilmesini ve kurallara bağlı olarak iade süreçlerinin başlatılmasını sağlar.

5. **Yolcu Bilgilerini Güncelleme**
   
   **API Metodu:** `PUT /api/tickets/{id}/passenger`
   
   **Açıklama:** Bilet satın alınan yolcunun sisteme girilen kimlik (TCKN/Pasaport vb.), isim veya iletişim bilgilerinin sonradan düzenlenmesini sağlar.

6. **Sisteme Yeni Sefer Ekleme (Admin)**
   
   **API Metodu:** `POST /api/admin/trips`
   
   **Açıklama:** Sistem yöneticilerinin (admin) platforma yeni uçak veya otobüs seferleri eklemesini sağlar. Kalkış-varış noktaları, saat, fiyat ve araç kapasitesi gibi verileri içerir.

7. **Sefer Bilgisini Güncelleme (Admin)** 
    
    **API Metodu:** `PUT /api/admin/trips/{id}`
    
    **Açıklama:** Sistem yöneticilerinin mevcut bir seferin gecikme durumu, saati, fiyatı veya araç/uçak tipi gibi detaylarında değişiklik yapmasını sağlar.

8. **Profil Sekmesi**
    
    **API Metodu:** `GET /api/users/profile`
    
    **Açıklama:** Kullanıcının kendi hesap bilgilerine erişmesini sağlar. Geçmiş biletler, yaklaşan seferler ve temel kullanıcı bilgileri listelenir.

9. **Profil Bilgilerini Güncelleme**
    
    **API Metodu:** `PUT /api/users/profile`
    
    **Açıklama:** Kullanıcının ad, soyad, telefon numarası gibi kişisel profil verilerini ve tercihlerini değiştirmesine olanak tanır.

10. **Hesap Silme**
    
    **API Metodu:** `DELETE /api/users/profile`
    
    **Açıklama:** Kullanıcının sistemdeki hesabını tamamen kapatmasını ve kişisel verilerinin KVKK/GDPR süreçlerine uygun olarak silinmesini sağlar.