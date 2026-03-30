# Furkan Burak Öztürk'ün REST API Metotları

**API Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Koltuk Rezerve Etme
- **Endpoint:** `POST /api/reservations`
- **Request Body:** ```json
  {
    "tripId": "65ab1234cdef5678",
    "seatNumber": "14A",
    "passengerId": "65ab9876lkjh5432"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Koltuk başarıyla rezerve edildi

## 2. Rezervasyon İptali
- **Endpoint:** `DELETE /api/reservations/{id}`
- **Path Parameters:** - `id` (string, required) - Rezervasyon ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Rezervasyon başarıyla iptal edildi

## 3. Bilet Satın Alma
- **Endpoint:** `POST /api/tickets`
- **Request Body:** ```json
  {
    "reservationId": "res_987654321",
    "paymentMethod": "credit_card",
    "amount": 450.00
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Bilet başarıyla oluşturuldu ve satın alındı

## 4. Bilet İptal Etme
- **Endpoint:** `DELETE /api/tickets/{id}`
- **Path Parameters:** - `id` (string, required) - Bilet ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Bilet iptal edildi ve iade süreci başlatıldı

## 5. Yolcu Bilgilerini Güncelleme
- **Endpoint:** `PUT /api/tickets/{id}/passenger`
- **Path Parameters:** - `id` (string, required) - Bilet ID'si
- **Request Body:** ```json
  {
    "firstName": "Furkan Burak",
    "lastName": "Öztürk",
    "identityNumber": "12345678900"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Yolcu bilgileri başarıyla güncellendi

## 6. Sisteme Yeni Sefer Ekleme (Admin)
- **Endpoint:** `POST /api/admin/trips`
- **Request Body:** ```json
  {
    "type": "bus",
    "departureLocation": "Ankara Otogar",
    "arrivalLocation": "İzmir Otogar",
    "departureTime": "2026-04-15T10:00:00Z",
    "price": 450,
    "capacity": 42
  }
  ```
- **Authentication:** Bearer Token gerekli (Sadece Admin yetkisi)
- **Response:** `201 Created` - Yeni sefer başarıyla eklendi

## 7. Sefer Bilgisini Güncelleme (Admin)
- **Endpoint:** `PUT /api/admin/trips/{id}`
- **Path Parameters:** - `id` (string, required) - Sefer ID'si
- **Request Body:** ```json
  {
    "price": 500,
    "departureTime": "2026-04-15T11:30:00Z",
    "status": "delayed"
  }
  ```
- **Authentication:** Bearer Token gerekli (Sadece Admin yetkisi)
- **Response:** `200 OK` - Sefer bilgileri güncellendi

## 8. Profil Sekmesi
- **Endpoint:** `GET /api/users/profile`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kullanıcı profili başarıyla getirildi

## 9. Profil Bilgilerini Güncelleme
- **Endpoint:** `PUT /api/users/profile`
- **Request Body:** ```json
  {
    "firstName": "Furkan Burak",
    "lastName": "Öztürk",
    "phone": "+905551234567",
    "preferences": {
      "newsletter": true
    }
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Profil bilgileri başarıyla güncellendi

## 10. Hesap Silme
- **Endpoint:** `DELETE /api/users/profile`
- **Authentication:** Bearer Token gerekli
- **Response:** `204 No Content` - Hesap kalıcı olarak silindi