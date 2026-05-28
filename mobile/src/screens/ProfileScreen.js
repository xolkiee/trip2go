import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, SafeAreaView, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import AuthScreen from './AuthScreen';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('trip2go_token');
      if (!token) {
         setIsLoggedIn(false);
         setLoading(false);
         return;
      }
      setIsLoggedIn(true);

      const response = await api.get('/users/profile', {
         headers: { Authorization: `Bearer ${token}` }
      });
      
      const user = response.data;
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    } catch (error) {
      console.log('Profil Hatası:', error);
      Alert.alert('Hata', 'Profil bilgileri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('trip2go_token');
      await api.put('/users/profile', profile, {
         headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    const doDelete = async () => {
      try {
        const token = await AsyncStorage.getItem('trip2go_token');
        await api.delete('/users/profile', { headers: { Authorization: `Bearer ${token}` } });
        await AsyncStorage.removeItem('trip2go_token');
        await AsyncStorage.removeItem('trip2go_user');
        Alert.alert('Hesap Silindi', 'Hesabınız başarıyla kapatıldı.');
        router.replace('/auth');
      } catch (error) {
        Alert.alert('Hata', 'Hesap silinirken hata oluştu.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?')) {
        doDelete();
      }
    } else {
      Alert.alert('Hesabı Sil', 'Hesabınızı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Evet, Sil', style: 'destructive', onPress: doDelete }
      ]);
    }
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      await AsyncStorage.removeItem('trip2go_token');
      await AsyncStorage.removeItem('trip2go_user');
      router.replace('/auth');
    };

    if (Platform.OS === 'web') {
      doLogout(); // Web'de direkt çıkış yapalım, Alert bazen takılıyor
    } else {
      Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: doLogout }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0b2261" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <AuthScreen 
        onSuccess={() => {
          setIsLoggedIn(true);
          fetchProfile();
        }} 
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{profile.firstName?.[0] || '?'}{profile.lastName?.[0] || ''}</Text>
          </View>
          <Text style={styles.nameText}>{profile.firstName} {profile.lastName}</Text>
          <Text style={styles.emailText}>{profile.email}</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad</Text>
            <TextInput 
              style={styles.input} 
              value={profile.firstName}
              onChangeText={(text) => setProfile({...profile, firstName: text})}
              placeholder="Adınız"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Soyad</Text>
            <TextInput 
              style={styles.input} 
              value={profile.lastName}
              onChangeText={(text) => setProfile({...profile, lastName: text})}
              placeholder="Soyadınız"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon Numarası</Text>
            <TextInput 
              style={styles.input} 
              value={profile.phone}
              onChangeText={(text) => setProfile({...profile, phone: text})}
              placeholder="Telefon Numaranız"
              keyboardType="phone-pad"
            />
          </View>
          
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>Değişiklikleri Kaydet</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Tehlikeli Bölge</Text>
          <Text style={styles.dangerDescription}>
            Hesabınızı sildiğinizde tüm geçmiş biletleriniz ve kişisel verileriniz KVKK standartlarına uygun olarak silinir.
          </Text>
          
          <TouchableOpacity style={[styles.deleteButton, {backgroundColor: '#6b7280', marginBottom: 15}]} onPress={handleLogout}>
            <Text style={styles.deleteButtonText}>Hesaptan Çıkış Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Hesabımı Kalıcı Olarak Sil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f5f9',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f5f9',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0b2261',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
  },
  updateButton: {
    backgroundColor: '#0b2261',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerZone: {
    backgroundColor: '#FEF2F2',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
