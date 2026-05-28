import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminAuthScreen({ onGoBack }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('bus');
  const [secretKey, setSecretKey] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') window.alert('Hata: Lütfen tüm alanları doldurun.');
      else Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('trip2go_token', response.data.token);
      await AsyncStorage.setItem('trip2go_user', JSON.stringify(response.data.user));
      
      setLoading(false);
      if (Platform.OS === 'web') {
        router.replace('/admin'); // Assuming /admin is the admin panel route
      } else {
        Alert.alert('Hoş Geldiniz', 'Yönetici Paneline Yönlendiriliyorsunuz.', [
          { text: 'Tamam', onPress: () => router.replace('/admin') }
        ]);
      }
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.message || 'Giriş başarısız oldu.';
      if (Platform.OS === 'web') window.alert('Hata: ' + errorMsg);
      else Alert.alert('Hata', errorMsg);
    }
  };

  const handleRegister = async () => {
    if (!companyName || !email || !password || !secretKey) {
      if (Platform.OS === 'web') window.alert('Hata: Lütfen zorunlu tüm alanları doldurun.');
      else Alert.alert('Hata', 'Lütfen zorunlu tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/admin-register', { 
        firstName: companyName, // Backend bu alanı firma adı olarak kaydedecek
        lastName: 'Yönetici', 
        email, 
        password, 
        secretKey, 
        companyType 
      });
      setLoading(false);
      
      if (Platform.OS === 'web') {
        window.alert('Yönetici hesabı başarıyla oluşturuldu. Lütfen giriş yapın.');
        setActiveTab('login');
      } else {
        Alert.alert('Başarılı', 'Yönetici hesabı başarıyla oluşturuldu. Lütfen giriş yapın.', [
          { text: 'Tamam', onPress: () => setActiveTab('login') }
        ]);
      }
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.message || 'Kayıt başarısız oldu.';
      if (Platform.OS === 'web') window.alert('Hata: ' + errorMsg);
      else Alert.alert('Hata', errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        
        <View style={styles.formCard}>
          <Text style={styles.title}>Trip2Go Yönetim Paneli</Text>
          
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'login' && styles.activeTab]} 
              onPress={() => setActiveTab('login')}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Giriş Yap</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'register' && styles.activeTab]} 
              onPress={() => setActiveTab('register')}
            >
              <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {activeTab === 'login' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Admin E-Posta</Text>
                  <TextInput style={styles.input} placeholder="admin@trip2go.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Şifre</Text>
                  <TextInput style={styles.input} placeholder="" secureTextEntry value={password} onChangeText={setPassword} />
                </View>

                <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Yönetici Girişi Yap</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Firma Adı</Text>
                  <TextInput style={styles.input} placeholder="Örn: Pamukkale Turizm" value={companyName} onChangeText={setCompanyName} />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Firmanızın Hizmet Türü</Text>
                  <TouchableOpacity style={styles.dropdownInput} onPress={() => setCompanyType(c => c === 'bus' ? 'flight' : 'bus')}>
                    <Text style={styles.dropdownText}>{companyType === 'bus' ? 'Otobüs' : 'Uçak'}</Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Kurumsal E-Posta</Text>
                  <TextInput style={styles.input} placeholder="admin@trip2go.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Şifre</Text>
                  <TextInput style={styles.input} placeholder="" secureTextEntry value={password} onChangeText={setPassword} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Yetkilendirme Anahtarı</Text>
                  <TextInput style={styles.input} placeholder="İpucu: trip2go-admin" secureTextEntry value={secretKey} onChangeText={setSecretKey} />
                </View>

                <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerBtnText}>Yönetici Olarak Kaydol</Text>}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.normalUserLink} onPress={() => {
              if (onGoBack) onGoBack();
              else router.replace('/auth');
            }}>
              <Text style={styles.normalUserLinkText}>Normal Kullanıcı Girişine Dön</Text>
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f5f9', justifyContent: 'center' },
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  formCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    width: '100%', 
    maxWidth: 500, 
    padding: 30, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 3 
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0b2261', textAlign: 'center', marginBottom: 25 },
  
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 25 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#d33b2b' },
  tabText: { fontSize: 16, color: '#6b7280', fontWeight: '600' },
  activeTabText: { color: '#0b2261', fontWeight: 'bold' },

  formContainer: {},
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, color: '#374151', marginBottom: 5, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, fontSize: 15, color: '#111827' },
  
  dropdownInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e5e7eb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12 },
  dropdownText: { fontSize: 15, color: '#111827' },
  dropdownArrow: { fontSize: 12, color: '#6b7280' },

  loginBtn: { backgroundColor: '#d33b2b', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  loginBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  registerBtn: { backgroundColor: '#0b2261', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  registerBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  normalUserLink: { marginTop: 25, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 20 },
  normalUserLinkText: { color: '#9ca3af', fontSize: 13 }
});
