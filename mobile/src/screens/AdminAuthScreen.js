import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

export default function AdminAuthScreen() {
  const [companyType, setCompanyType] = useState('bus'); // 'bus' | 'flight'
  const [secretKey, setSecretKey] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = () => {
    if (!companyName || !secretKey) {
      Alert.alert('Hata', 'Lütfen firma adını ve kayıt anahtarını girin.');
      return;
    }
    
    // Güvenlik Kuralı
    if (secretKey !== 'trip2go-admin') {
      Alert.alert('Geçersiz Anahtar', 'Firma kayıt anahtarı hatalı. Sisteme yönetici girişi yapılamaz.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Hoş Geldiniz', `${companyName} Yönetici Paneline Yönlendiriliyorsunuz.`, [
        { text: 'Tamam', onPress: () => router.replace('/admin') }
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
          <Text style={styles.title}>Yönetici Paneli</Text>
          <Text style={styles.subtitle}>Otobüs veya Uçak firmaları için sisteme giriş ve sefer yönetimi modülü.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Firma Tipi Seçimi</Text>
          <View style={styles.typeToggle}>
            <TouchableOpacity 
              style={[styles.typeButton, companyType === 'bus' && styles.typeActive]}
              onPress={() => setCompanyType('bus')}
            >
              <Text style={[styles.typeText, companyType === 'bus' && styles.typeActiveText]}>🚌 Otobüs Firması</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeButton, companyType === 'flight' && styles.typeActive]}
              onPress={() => setCompanyType('flight')}
            >
              <Text style={[styles.typeText, companyType === 'flight' && styles.typeActiveText]}>✈️ Uçak Firması</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Firma Adı</Text>
            <TextInput style={styles.input} placeholder="Örn: Trip2Go Express" value={companyName} onChangeText={setCompanyName} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Firma Kayıt Anahtarı (Secret Key)</Text>
            <TextInput style={styles.input} placeholder="Gizli anahtarı giriniz" secureTextEntry value={secretKey} onChangeText={setSecretKey} />
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleAdminLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Yönetici Olarak Giriş Yap</Text>}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f5f9' },
  container: { flex: 1, padding: 20 },
  backButton: { marginBottom: 20, marginTop: 10 },
  backButtonText: { color: '#0b2261', fontSize: 16, fontWeight: 'bold' },
  
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6b7280', lineHeight: 22 },
  
  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 15 },
  
  typeToggle: { flexDirection: 'row', backgroundColor: '#f4f5f9', borderRadius: 12, padding: 5, marginBottom: 25 },
  typeButton: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 10 },
  typeActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
  typeText: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  typeActiveText: { color: '#0b2261', fontWeight: 'bold' },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#374151', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 14, fontSize: 16, color: '#111827' },
  
  actionButton: { backgroundColor: '#374151', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
