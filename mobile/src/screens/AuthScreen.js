import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import AdminAuthScreen from './AdminAuthScreen';

export default function AuthScreen({ onSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (!email.endsWith('.com')) {
      Alert.alert('Geçersiz E-posta', 'Lütfen .com uzantılı geçerli bir e-posta adresi girin.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('trip2go_token', response.data.token);
      await AsyncStorage.setItem('trip2go_user', JSON.stringify(response.data.user));
      
      setLoading(false);
      
      if (onSuccess) {
        onSuccess();
        return;
      }
      
      if (Platform.OS === 'web') {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Başarılı', 'Giriş yapıldı!', [
          { text: 'Tamam', onPress: () => router.replace('/(tabs)') }
        ]);
      }
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.message || 'Giriş başarısız oldu.';
      if (Platform.OS === 'web') {
        window.alert('Hata: ' + errorMsg);
      } else {
        Alert.alert('Hata', errorMsg);
      }
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (!email.endsWith('.com')) {
      Alert.alert('Geçersiz E-posta', 'Lütfen .com uzantılı geçerli bir e-posta adresi girin.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { firstName, lastName, email, password });
      setLoading(false);

      if (Platform.OS === 'web') {
        window.alert('Hesabınız oluşturuldu. Lütfen giriş yapın.');
        setActiveTab('login');
      } else {
        Alert.alert('Kayıt Başarılı', 'Hesabınız oluşturuldu. Lütfen giriş yapın.', [
          { text: 'Tamam', onPress: () => setActiveTab('login') }
        ]);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Hata', error.response?.data?.message || 'Kayıt başarısız oldu.');
    }
  };

  if (isAdminView) {
    return <AdminAuthScreen onGoBack={() => setIsAdminView(false)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        
        <View style={styles.header}>
          <Text style={styles.logoText}>Trip2Go</Text>
          <Text style={styles.subtitle}>Hızlı ve güvenli bilet almanın adresi</Text>
        </View>

        <View style={styles.formCard}>
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

          {/* Form */}
          <View style={styles.formContainer}>
            {activeTab === 'register' && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Adınız</Text>
                  <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Soyadınız</Text>
                  <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-Posta Adresi</Text>
              <TextInput style={styles.input} placeholder="ornek@mail.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Şifre</Text>
              <TextInput style={styles.input} placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />
            </View>

            {activeTab === 'login' && (
              <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/forgot-password')}>
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={activeTab === 'login' ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.actionButtonText}>
                  {activeTab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

        </View>

        {/* Admin Login Link */}
        <TouchableOpacity style={styles.adminLink} onPress={() => setIsAdminView(true)}>
          <Text style={styles.adminLinkText}>Yönetici Paneli İçin Tıklayın</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b2261' },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#bae6fd' },
  
  formCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, padding: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#d33b2b' },
  tabText: { fontSize: 16, color: '#6b7280', fontWeight: '600' },
  activeTabText: { color: '#d33b2b', fontWeight: 'bold' },
  
  formContainer: { padding: 25 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: '#374151', marginBottom: 5, fontWeight: '600' },
  input: { backgroundColor: '#f4f5f9', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 14, fontSize: 16, color: '#111827' },
  
  forgotPassword: { alignItems: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { color: '#0b2261', fontSize: 14, fontWeight: '600' },
  
  actionButton: { backgroundColor: '#d33b2b', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  adminLink: { marginTop: 30, alignItems: 'center' },
  adminLinkText: { color: '#fff', fontSize: 14, textDecorationLine: 'underline' }
});
