# Ömer Arı'nın REST API Metotları

**API Test Videosu:** [Youtube Linki](https://www.youtube.com/watch?v=G-mO9pfhUM4)

## 1. Kullanıcı Kaydı (Register)
- **Endpoint:** `POST /api/auth/register`
- **Request Body:** ```json
  {
    "firstName": "Ömer",
    "lastName": "Arı",
    "email": "omer.ari@example.com",
    "password": "strongPassword123!",
    "phone": "0555 444 33 22"
  }
  ```
- **Detaylar:** `firstName`, `lastName`, `email` ve `password` zorunludur. `phone` opsiyoneldir.
- **Authentication:** Gerekli değil
- **Response:** `201 Created` - `{ "success": true, "message": "...", "user": { "id": "...", "email": "..." } }`

## 2. Kullanıcı Girişi (Login)
- **Endpoint:** `POST /api/auth/login`
- **Request Body:** ```json
  {
    "email": "omer.ari@example.com",
    "password": "strongPassword123!"
  }
  ```
- **Authentication:** Gerekli değil
- **Response:** `200 OK` - Dönen `user` nesnesinde `role`, `companyName` ve `companyType` alanları bulunur. `token` localStorage'a kaydedilmelidir.

## 3. Şifre Sıfırlama (Forgot/Reset Password)
- **Endpoint:** `POST /api/auth/forgot-password`
- **Request Body:** ```json
  {
    "email": "omer.ari@example.com"
  }
  ```
- **Response:** `200 OK` - Demo amaçlı `resetToken` hem loglara basılır hem de responseta döner.

- **Endpoint:** `PUT /api/auth/reset-password`
- **Request Body:** ```json
  {
    "token": "reset_token_gelen_veri",
    "newPassword": "yeniGucluSifre123"
  }
  ```
- **Response:** `200 OK` - Şifre başarıyla güncellendi.

## 4. Şehir ve Havalimanı Listesi
- **Endpoint:** `GET /api/locations`
- **Authentication:** Gerekli değil
- **Response:** `200 OK` - `{ "success": true, "count": 100, "data": [ { "id": "...", "type": "city/airport", "name": "...", "code": "..." } ] }`

## 5. Sefer Arama
- **Endpoint:** `GET /api/trips/search`
- **Query Parameters:** 
  - `origin` (string) - Kalkış yeri (Regex destekli)
  - `destination` (string) - Varış yeri (Regex destekli)
  - `tripDate` (string) - Sefer tarihi (YYYY-MM-DD formatında)
  - `type` (string) - `bus` veya `flight`
- **Detaylar:** Backend, geçmiş tarihli seferleri otomatik olarak filtreler.
- **Response:** `200 OK` - Her sefer nesnesinde `availableSeats` ve admin puanlarını içeren `ratingInfo` objesi bulunur.

## 6. Sefer Detayları ve Koltuk Haritası
- **Endpoint:** `GET /api/trips/{id}/details`
- **Path Parameters:** `id` - Seferin benzersiz ID'si
- **Response:** `200 OK` - `seats` dizisi içindeki her koltuk `status` ("available", "occupied", "reserved") ve rezerve edilmişse `gender` ("erkek", "kadin") bilgisiyle gelir.

## 7. Yorum ve Değerlendirme Ekleme
- **Endpoint:** `POST /api/reviews`
- **Request Body:** ```json
  {
    "tripId": "sefer_id_buraya",
    "userId": "kullanici_id_buraya",
    "rating": 5,
    "comment": "Konforlu bir yolculuktu, şoför bey çok beyefendiydi."
  }
  ```
- **Detaylar:** Puanlama 1 ile 5 arasında olmalıdır.
- **Authentication:** Bearer Token (Gerekli)
- **Response:** `201 Created` - Değerlendirme başarıyla kaydedildi.

## 8. Firma Yorumlarını Listeleme
- **Endpoint:** `GET /api/reviews/trip/{id}`
- **Path Parameters:** `id` - Sefer ID'si
- **Detaylar:** İlgili sefere ait yorumlar listelenir. Kullanıcı isimleri `F**** B****` şeklinde maskelenerek (`maskedUser` alanı) döner.
- **Response:** `200 OK` - `{ "success": true, "data": [ { "id": "...", "maskedUser": "...", "rating": 5, "comment": "..." } ] }`

## 9. Yorum Düzenleme
- **Endpoint:** `PUT /api/reviews/{id}`
- **Path Parameters:** `id` - Yorum ID'si
- **Request Body:** ```json
  {
    "rating": 4,
    "comment": "Klimada ufak bir sorun vardı ama düzelttiler."
  }
  ```
- **Authentication:** Bearer Token (Gerekli)

## 10. Yorum Silme
- **Endpoint:** `DELETE /api/reviews/{id}`
- **Path Parameters:** `id` - Yorum ID'si
- **Authentication:** Bearer Token (Gerekli)
