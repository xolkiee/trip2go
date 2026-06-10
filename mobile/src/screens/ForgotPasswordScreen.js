import React, { useState } from 'react';
import {  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import api from '../services/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Token & New Password
  const [token, setToken] = useState('');
  const [demoToken, setDemoToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    if (!email) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
      return;
    }
    if (!email.endsWith('.com')) {
      Alert.alert('Hata', 'Lütfen .com uzantılı geçerli bir e-posta girin.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setDemoToken(response.data.resetToken); // Gelen dinamik token'i state'e yaz
        setStep(2);
      }
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.message || 'Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token || !newPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.put('/auth/reset-password', { token, newPassword });
      if (response.data.success) {
        if (Platform.OS === 'web') {
          window.alert('Şifreniz başarıyla yenilendi.');
          router.replace('/auth');
        } else {
          Alert.alert('Başarılı', 'Şifreniz başarıyla yenilendi.', [
            { text: 'Giriş Yap', onPress: () => router.replace('/auth') }
          ]);
        }
      }
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.message || 'Geçersiz token veya şifre güncellenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Geri Dön</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>
            {step === 1 ? 'Şifremi Unuttum' : 'Yeni Şifre Belirle'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1 
              ? 'Hesabınıza kayıtlı e-posta adresini girerek şifre sıfırlama bağlantısı alabilirsiniz.' 
              : 'Doğrulama kodunu ve yeni şifrenizi girin.'}
          </Text>
        </View>

        <View style={styles.formCard}>
          {step === 1 ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-Posta Adresiniz</Text>
                <TextInput style={styles.input} placeholder="ornek@mail.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
              </View>
              <TouchableOpacity style={styles.actionButton} onPress={handleSendLink} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Sıfırlama Linki Gönder</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.successBox}>
                <Text style={styles.successBoxText}>
                  Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
                  {'\n'}(Demo Token: {demoToken})
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Doğrulama Kodu (Token)</Text>
                <TextInput style={styles.input} placeholder="" autoCapitalize="none" value={token} onChangeText={setToken} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yeni Şifreniz</Text>
                <TextInput style={styles.input} placeholder="" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
              </View>
              <TouchableOpacity style={styles.actionButton} onPress={handleResetPassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Şifreyi Güncelle</Text>}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.loginLink} onPress={() => router.replace('/auth')}>
            <Text style={styles.loginLinkText}>Giriş Ekranına Dön</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f5f9' },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  backButton: { marginBottom: 20 },
  backButtonText: { color: '#0b2261', fontSize: 16, fontWeight: 'bold' },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6b7280', lineHeight: 22 },
  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#374151', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 14, fontSize: 16, color: '#111827' },
  actionButton: { backgroundColor: '#d33b2b', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  successBox: { backgroundColor: '#d1fae5', padding: 15, borderRadius: 8, marginBottom: 20 },
  successBoxText: { color: '#065f46', fontSize: 14, lineHeight: 20 },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginLinkText: { color: '#0b2261', fontSize: 15, fontWeight: 'bold' }
});

