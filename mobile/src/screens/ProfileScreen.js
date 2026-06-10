import React, { useState, useCallback } from 'react';
import {  View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Platform  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [hasActiveTickets, setHasActiveTickets] = useState(false);
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
        phone: user.phone || '',
        password: ''
      });
      
      if (user.tickets) {
         const active = user.tickets.some(t => t.status === 'active' && new Date(t.trip?.arrivalTime) >= new Date());
         setHasActiveTickets(active);
      }
    } catch (error) {
      console.log('Profil Hatası:', error);
      Alert.alert('Hata', 'Profil bilgileri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (text) => {
    let rawVal = text;
    if (profile.phone.length > rawVal.length && profile.phone.endsWith(' ') && !rawVal.endsWith(' ')) {
       rawVal = rawVal.slice(0, -1);
    }
    let val = rawVal.replace(/\D/g, '');
    if (val.length > 0 && val[0] !== '0') val = '0' + val;
    if (val.length > 11) val = val.slice(0, 11);
    
    let formatted = val;
    if (val.length > 3 && val.length <= 6) {
      formatted = `${val.slice(0,4)} ${val.slice(4)}`;
    } else if (val.length > 6 && val.length <= 8) {
      formatted = `${val.slice(0,4)} ${val.slice(4,7)} ${val.slice(7)}`;
    } else if (val.length > 8) {
      formatted = `${val.slice(0,4)} ${val.slice(4,7)} ${val.slice(7,9)} ${val.slice(9)}`;
    }
    setProfile({...profile, phone: formatted});
  };

  const handleUpdate = async () => {
    if (profile.phone && profile.phone.length < 14) {
       if (Platform.OS === 'web') window.alert('Lütfen telefon numarasını eksiksiz giriniz (örn: 05xx xxx xx xx).');
       else Alert.alert('Hata', 'Lütfen telefon numarasını eksiksiz giriniz (örn: 05xx xxx xx xx).');
       return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('trip2go_token');
      
      const payload = { 
        firstName: profile.firstName, 
        lastName: profile.lastName, 
        phone: profile.phone 
      };
      if (profile.password) payload.password = profile.password;

      const response = await api.put('/users/profile', payload, {
         headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        await AsyncStorage.setItem('trip2go_token', response.data.token);
        await AsyncStorage.setItem('trip2go_user', JSON.stringify(response.data.user));
        setProfile({...profile, password: ''});
        
        if (Platform.OS === 'web') window.alert(response.data.message || 'Profil bilgileriniz güncellendi.');
        else Alert.alert('Başarılı', response.data.message || 'Profil bilgileriniz güncellendi.');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Profil güncellenirken bir sorun oluştu.';
      if (Platform.OS === 'web') window.alert('Hata: ' + msg);
      else Alert.alert('Hata', msg);
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
            <Text style={styles.label}>E-Posta Adresi <Text style={styles.mutedText}>(Değiştirilemez)</Text></Text>
            <TextInput 
              style={[styles.input, {backgroundColor: '#e5e7eb', color: '#6b7280'}]} 
              value={profile.email}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon Numarası</Text>
            <TextInput 
              style={styles.input} 
              value={profile.phone}
              onChangeText={handlePhoneChange}
              placeholder="Örn: 0555 444 33 22"
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Şifre Belirle <Text style={styles.mutedText}>(Aynı kalması için boş bırakın)</Text></Text>
            <TextInput 
              style={styles.input} 
              value={profile.password}
              onChangeText={(text) => setProfile({...profile, password: text})}
              placeholder="Yeni şifrenizi girin..."
              secureTextEntry
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
            Hesabınızı silerseniz sisteme ait verileriniz, seyahat geçmişiniz ve platformda yaptığınız tüm yorumlar kalıcı olarak silinecektir. Bu işlem geri alınamaz.
          </Text>
          
          {hasActiveTickets && (
             <View style={styles.warningBox}>
               <Text style={styles.warningBoxText}>
                 <Text style={{fontWeight: 'bold'}}>Dikkat! </Text>
                 Şu anda ileri tarihli ve iptal edilmemiş "Aktif" biletleriniz bulunmaktadır. Hesabınızı silmeniz durumunda bu biletler otomatik olarak İPTAL EDİLECEK ve kurallar gereği ücret iadesi YAPILMAYACAKTIR.
               </Text>
             </View>
          )}
          
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
  mutedText: {
    color: '#9ca3af',
    fontWeight: 'normal',
    fontSize: 12,
  },
  warningBox: {
    backgroundColor: '#fee2e2',
    borderColor: '#f87171',
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15
  },
  warningBoxText: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20
  }
});

