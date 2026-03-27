const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Başlıkta Bearer Token var mı kontrol edelim
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // "Bearer [token_string]" dizilimini parçalıyoruz
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-trip2go-key-2026');

      // JWT'den ayıklanan id bilgisiyle user objesini çekip isteğe yapıştırıyoruz (şifre hariç)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
         return res.status(401).json({ message: 'Yetkilendirme reddedildi: Kullanıcı bulunamadı.' });
      }

      next();
    } catch (error) {
      console.error("Token Doğrulama Hatası:", error);
      res.status(401).json({ message: 'Yetkilendirme reddedildi: Token geçersiz.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Yetkilendirme reddedildi: Token sağlanmadı.' });
  }
};

module.exports = { protect };
