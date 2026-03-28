const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// JWT için kullanılacak gizli anahtar
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-trip2go-key-2026';

// @desc    Yeni kullanıcı kaydı oluşturur (Register)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Lütfen zorunlu tüm alanları doldurun.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten mevcut.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: 'user'
    });

    console.log('Yeni kullanıcı kayıt oldu:', email);

    res.status(201).json({
      success: true,
      message: 'Kayıt işlemi başarıyla tamamlandı.',
      user: {
        id: newUser._id,
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

    // Furkan'ın admin paneli testleri için MongoDB'de olmasa da geçici destek eklenebilir
    if (email === 'admin@trip2go.com' && password === 'admin') {
      const token = jwt.sign(
        { id: 'admin_1', email: 'admin@trip2go.com', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      return res.status(200).json({
        success: true,
        message: 'Admin girişi başarılı.',
        token,
        user: { id: 'admin_1', firstName: 'Sistem', lastName: 'Yöneticisi', email: 'admin@trip2go.com', role: 'admin' }
      });
    }

    // MongoDB kullanıcı araması
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, companyName: user.companyName, companyType: user.companyType },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log('Kullanıcı giriş yaptı:', user.email);

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        companyName: user.companyName || '',
        companyType: user.companyType || ''
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.' });
    }

    const resetToken = Math.random().toString(36).substring(2, 15);
    user.resetToken = resetToken;
    await user.save();
    
    console.log(`Şifre sıfırlama talebi alındı: ${email}. Token: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
      resetToken // Demo amaçlı frontende de gönderiyoruz
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

    const user = await User.findOne({ resetToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş bir token girdiniz.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetToken = undefined;
    await user.save();

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

// @desc    Admin kullanıcısı oluşturur
// @route   POST /api/auth/admin-register
// @access  Public
const registerAdminUser = async (req, res) => {
  try {
    // Admin kayıt formundan companyType de gelecek
    const { firstName, lastName, email, password, secretKey, companyType } = req.body;

    if (!firstName || !lastName || !email || !password || !secretKey || !companyType) {
      return res.status(400).json({ message: 'Lütfen zorunlu tüm alanları doldurun (Taşıt Türü dahil).' });
    }

    if (secretKey !== 'trip2go-admin') {
      return res.status(403).json({ message: 'Geçersiz Admin Kayıt Anahtarı!' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten mevcut.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      firstName, // Frontend firstName'i şirket ismi olarak yolluyor
      lastName,
      email,
      password: hashedPassword,
      role: 'admin',
      companyName: firstName, // Orijinal plan: Firma ismi giriliyor, bunu companyName e kopyalayalım.
      companyType: companyType // bus veya flight
    });

    res.status(201).json({
      success: true,
      message: 'Yönetici hesabı başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.'
    });

  } catch (error) {
    console.error('Admin Register Hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  registerAdminUser
};
