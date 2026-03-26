const jwt = require('jsonwebtoken');

// Veritabanı (MongoDB) kullanılmadığı için kullanıcıları geçici olarak hafızada tutuyoruz.
// Sunucu yeniden başlatıldığında bu liste sıfırlanacaktır.
let users = [
  {
    id: 'admin_1',
    firstName: 'Sistem',
    lastName: 'Yöneticisi',
    email: 'admin@trip2go.com',
    password: 'admin',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

// JWT için kullanılacak gizli anahtar (Gerçek uygulamada .env dosyasından alınmalıdır)
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-trip2go-key-2026';

// @desc    Yeni kullanıcı kaydı oluşturur (Register)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Gerekli alanların kontrolü
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Lütfen zorunlu tüm alanları doldurun.' });
    }

    // Kullanıcı var mı kontrolü
    const userExists = users.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten mevcut.' });
    }

    // Yeni kullanıcı objesi
    const newUser = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      password, // Şifreyi güvenlik gereği bcrypt ile şifrelememiz gerekir, ancak demo amaçlı düz metin olarak alıyoruz.
      phone: phone || '',
      role: 'user', // varsayılan rol
      createdAt: new Date().toISOString()
    };

    // Bellekteki listeye ekle
    users.push(newUser);
    
    // Test amaçlı konsola yazdır
    console.log('Yeni kullanıcı kayıt oldu:', email, '| Toplam kullanıcı:', users.length);

    // İstenirse kayıt olduktan sonra direkt giriş yapabilmesi için token verilebilir.
    // Şimdilik sadece başarılı mesajı dönüyoruz.
    res.status(201).json({
      success: true,
      message: 'Kayıt işlemi başarıyla tamamlandı.',
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Register Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

// @desc    Kullanıcı girişi yapar (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Lütfen e-posta ve şifrenizi girin.' });
    }

    // Kullanıcıyı e-posta ve şifre ile bul
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
    }

    // JWT Token oluştur
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log('Kullanıcı giriş yaptı:', user.email);

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı.',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

// @desc    Şifre sıfırlama talebi oluşturur (Forgot Password)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Lütfen e-posta adresinizi girin.' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ message: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.' });
    }

    // Sahte bir token üret
    const resetToken = Math.random().toString(36).substring(2, 15);
    user.resetToken = resetToken;
    
    console.log(`Şifre sıfırlama talebi alındı: ${email}. Token: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
      // Gerçekte token dönderilmez, buraya demo amaçlı ve frontend'de kullanmak için koyuyoruz.
      resetToken
    });

  } catch (error) {
    console.error('Forgot Password Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

// @desc    Şifre yeniler (Reset Password)
// @route   PUT /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Lütfen yeni şifrenizi ve token bilginizi girin.' });
    }

    const user = users.find(u => u.resetToken === token);

    if (!user) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş bir token girdiniz.' });
    }

    // Şifreyi güncelle ve token'i sil
    user.password = newPassword;
    delete user.resetToken;

    console.log(`Kullanıcı şifresi yenilendi: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Şifreniz başarıyla yenilendi. Artık giriş yapabilirsiniz.'
    });

  } catch (error) {
    console.error('Reset Password Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
};
