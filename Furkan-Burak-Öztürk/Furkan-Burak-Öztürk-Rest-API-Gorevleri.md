# Furkan Burak Öztürk'ün REST API Metotları

**API Test Videosu:** [Youtube Linki](https://www.youtube.com/watch?v=j-9eUAhBVro)

## 1. Koltuk Rezerve Etme
- **Endpoint:** `POST /api/reservations`
- **Request Body:** ```json
  {
    "tripId": "69d118ddb6d94ef733b37ac3",
    "seats": [
      {
        "seatNumber": 14,
        "gender": "erkek"
      }
    ]
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Koltuk 10 dakikalığına başarıyla rezerve edildi

## 2. Rezervasyon İptali
- **Endpoint:** `DELETE /api/reservations/{id}`
- **Path Parameters:** - `id` (string, required) - Rezervasyon ID'si (Örn: 65ab1234cdef567890abcdef)
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Rezervasyon başarıyla iptal edildi, koltuklar boşa çıktı

## 3. Bilet Satın Alma
- **Endpoint:** `POST /api/tickets`
- **Request Body:** ```json
  {
    "tripId": "69d118ddb6d94ef733b37ac3",
    "passengers": [
      {
        "seatNumber": 14,
        "passengerInfo": {
          "firstName": "Furkan Burak",
          "lastName": "Öztürk",
          "identityNumber": "12345678900",
          "contactPhone": "05554443322"
        },
        "gender": "erkek"
      }
    ],
    "price": 450
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Note:** Kredi kartı bilgileri yalnızca frontend'de doğrulanıp ödeme işlemcisinden (mock) geçtiği için backende güvenlik gereği gönderilmez.
- **Response:** `201 Created` - Ödeme başarılı, biletler oluşturuldu

## 4. Bilet İptal Etme
- **Endpoint:** `DELETE /api/tickets/{id}`
- **Path Parameters:** - `id` (string, required) - Bilet ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Bilet iptal edildi ve koltuk diğer yolcular için serbest bırakıldı

## 5. Yolcu Bilgilerini Güncelleme
- **Endpoint:** `PUT /api/tickets/{id}/passenger`
- **Path Parameters:** - `id` (string, required) - Bilet ID'si
- **Request Body:** ```json
  {
    "passenger": {
      "firstName": "Furkan Yeni",
      "lastName": "Öztürk",
      "identityNumber": "12345678900",
      "contactPhone": "05554443321"
    }
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Yolcu bilgileri başarıyla güncellendi

## 6. Sisteme Yeni Sefer Ekleme (Admin)
- **Endpoint:** `POST /api/admin/trips`
- **Request Body:** ```json
  {
    "company": "Pamukkale Turizm",
    "type": "bus",
    "seatLayout": "2+1",
    "departure": "Isparta",
    "destination": "Antalya",
    "date": "2026-04-10",
    "time": "22:00",
    "arrivalTime": "00:00",
    "price": 250
  }
  ```
- **Authentication:** Bearer Token gerekli (Sadece Admin yetkisi)
- **Response:** `201 Created` - Yeni sefer ve koltuk şeması başarıyla oluşturuldu

## 7. Sefer Bilgisini Güncelleme (Admin)
- **Endpoint:** `PUT /api/admin/trips/{id}`
- **Path Parameters:** - `id` (string, required) - Sefer ID'si
- **Request Body:** ```json
  {
    "departure": "Isparta",
    "destination":"Antalya",
    "price": 350,
    "date": "2026-05-20",
    "time": "22:30",
    "arrivalTime": "00:30"
  }
  ```
- **Authentication:** Bearer Token gerekli (Sadece Admin yetkisi)
- **Response:** `200 OK` - Sefer bilgileri (fiyat, saat vb.) güncellendi

## 8. Profil Sekmesi
- **Endpoint:** `GET /api/users/profile`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kullanıcı profili ve geçmiş biletleri getirildi

## 9. Profil Bilgilerini Güncelleme
- **Endpoint:** `PUT /api/users/profile`
- **Request Body:** ```json
  {
    "firstName": "Furkan Burak",
    "lastName": "Öztürk",
    "phone": "05551112233",
    "password": "12345"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Profil bilgileri güncellendi ve yeni token döndürüldü

## 10. Hesap Silme
- **Endpoint:** `DELETE /api/users/profile`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Hesap, yorumlar ve rezervasyonlar tamamen silindi