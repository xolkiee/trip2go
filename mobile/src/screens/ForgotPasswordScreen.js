import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendLink = () => {
    if (!email) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
      return;
    }
    if (!email.endsWith('.com')) {
      Alert.alert('Hata', 'Lütfen .com uzantılı geçerli bir e-posta girin.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleResetPassword = () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler birbiriyle uyuşmuyor.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Başarılı', 'Şifreniz başarıyla yenilendi.', [
        { text: 'Giriş Yap', onPress: () => router.replace('/auth') }
      ]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Geri Dön</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            {step === 1 
              ? 'Hesabınıza kayıtlı e-posta adresini girerek şifre sıfırlama bağlantısı alabilirsiniz.' 
              : 'Lütfen hesabınız için yeni bir şifre belirleyin.'}
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
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Sıfırlama Bağlantısı Gönder</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yeni Şifre</Text>
                <TextInput style={styles.input} placeholder="Yeni Şifreniz" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Yeni Şifre (Tekrar)</Text>
                <TextInput style={styles.input} placeholder="Yeni Şifrenizi Doğrulayın" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
              </View>
              <TouchableOpacity style={styles.actionButton} onPress={handleResetPassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Şifreyi Güncelle</Text>}
              </TouchableOpacity>
            </>
          )}
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
});
