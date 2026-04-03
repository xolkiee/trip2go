# Ömer Arı'nın REST API Metotları

**API Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Kullanıcı Kaydı
- **Endpoint:** `POST /api/auth/register`
- **Request Body:** ```json
  {
    "firstName": "Ömer",
    "lastName": "Arı",
    "email": "omer.ari@example.com",
    "password": "strongPassword123!"
  }
  ```
- **Authentication:** Gerekli değil
- **Response:** `201 Created` - Kullanıcı başarıyla kaydedildi

## 2. Kullanıcı Girişi
- **Endpoint:** `POST /api/auth/login`
- **Request Body:** ```json
  {
    "email": "omer.ari@example.com",
    "password": "strongPassword123!"
  }
  ```
- **Authentication:** Gerekli değil
- **Response:** `200 OK` - Giriş başarılı, token döndürüldü

## 3. Şifremi Unuttum
- **Endpoint:** `POST /api/auth/forgot-password`
- **Request Body:** ```json
  {
    "email": "omer.ari@example.com"
  }
  ```
- **Authentication:** Gerekli değil
- **Response:** `200 OK` - Sıfırlama bağlantısı e-posta adresine gönderildi

- **Endpoint:** `PUT /api/auth/reset-password`
- **Request Body:** ```json
  {
    "token": "reset_token_xxx",
    "newPassword": "newStrongPassword123!"
  }
  ```
- **Authentication:** Gerekli değil
- **Response:** `200 OK` - Şifre başarıyla sıfırlandı

## 4. Şehir/Havalimanı Listesini Getirme
- **Endpoint:** `GET /api/locations`
- **Authentication:** Gerekli değil
- **Response:** `200 OK` - Lokasyon listesi başarıyla getirildi

## 5. Seferleri Arama
- **Endpoint:** `GET /api/trips/search`
- **Query Parameters:** 
  - `origin` (string, required) - Kalkış noktası
  - `destination` (string, required) - Varış noktası
  - `date` (string, required) - Sefer tarihi (YYYY-MM-DD)
  - `type` (string, optional) - bus veya flight
- **Authentication:** Gerekli değil
- **Response:** `200 OK` - Arama kriterlerine uygun seferler listelendi

## 6. Sefer Detayı ve Koltuk Durumu Getirme
- **Endpoint:** `GET /api/trips/{id}/details`
- **Path Parameters:** - `id` (string, required) - Sefer ID'si
- **Authentication:** Gerekli değil
- **Response:** `200 OK` - Sefer detayları ve koltuk durumları başarıyla getirildi

## 7. Firma/Sefer Değerlendirmesi Ekleme
- **Endpoint:** `POST /api/reviews`
- **Request Body:** ```json
  {
    "tripId": "65cb9876lkjh5432",
    "rating": 5,
    "comment": "Yolculuk çok rahat ve güvenliydi."
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Değerlendirme başarıyla eklendi

## 8. Firma/Sefer Yorumlarını Listeleme
- **Endpoint:** `GET /api/reviews/trip/{id}`
- **Path Parameters:** - `id` (string, required) - Sefer ID'si
- **Authentication:** Gerekli değil
- **Response:** `200 OK` - İlgili sefere ait yorumlar listelendi

## 9. Kullanıcının Kendi Yorumunu Düzenlemesi
- **Endpoint:** `PUT /api/reviews/{id}`
- **Path Parameters:** - `id` (string, required) - Yorum ID'si
- **Request Body:** ```json
  {
    "rating": 4,
    "comment": "Biraz rötarlı kalktı ama genel olarak iyiydi."
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Yorum başarıyla güncellendi

## 10. Kullanıcının Yorumunu Silmesi
- **Endpoint:** `DELETE /api/reviews/{id}`
- **Path Parameters:** - `id` (string, required) - Yorum ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Yorum başarıyla silindi
