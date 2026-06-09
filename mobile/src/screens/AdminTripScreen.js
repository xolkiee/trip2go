import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, TextInput, Modal, ActivityIndicator, FlatList, Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function AdminTripScreen() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null); // null means adding a new trip
  const [formData, setFormData] = useState({ departure: '', destination: '', date: '', time: '', arrivalTime: '', price: '' });
  const [saving, setSaving] = useState(false);
  const [adminCompany, setAdminCompany] = useState('');
  const [adminType, setAdminType] = useState('bus');

  // Pickers state
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationSelectionType, setLocationSelectionType] = useState('origin');
  const [upcomingDates, setUpcomingDates] = useState([]);
  const [dateModalVisible, setDateModalVisible] = useState(false);

  useEffect(() => {
    fetchTrips();
    loadAdminData();
    fetchLocations();
    generateDates();
  }, []);

  const loadAdminData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('trip2go_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setAdminCompany(user.companyName || user.firstName || 'Firma');
        setAdminType(user.companyType || 'bus');
      }
    } catch (e) {}
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('trip2go_token');
      const res = await api.get('/admin/trips', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTrips(res.data.data);
      }
    } catch (err) {
      Alert.alert('Hata', 'Seferler yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations');
      if (res.data.success) {
        const sorted = res.data.data.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        setLocations(sorted);
        setFilteredLocations(sorted);
      }
    } catch (e) {}
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    setUpcomingDates(dates);
  };

  const openLocationModal = (type) => {
    setLocationSelectionType(type);
    setLocationSearchQuery('');
    const filtered = locations.filter(loc => {
      if (adminType === 'bus' && loc.type !== 'city') return false;
      if (adminType === 'flight' && loc.type !== 'airport') return false;
      return true;
    });
    setFilteredLocations(filtered);
    setLocationModalVisible(true);
  };

  const filterLocations = (text) => {
    setLocationSearchQuery(text);
    const lowerText = text.toLocaleLowerCase('tr-TR');
    let baseFilter = locations.filter(loc => {
      if (adminType === 'bus' && loc.type !== 'city') return false;
      if (adminType === 'flight' && loc.type !== 'airport') return false;
      return true;
    });
    if (text) {
      baseFilter = baseFilter.filter(loc => loc.name && loc.name.toLocaleLowerCase('tr-TR').includes(lowerText));
    }
    setFilteredLocations(baseFilter);
  };

  const selectLocation = (loc) => {
    if (locationSelectionType === 'origin') {
      setFormData(prev => ({...prev, departure: loc.name}));
    } else {
      setFormData(prev => ({...prev, destination: loc.name}));
    }
    setLocationModalVisible(false);
  };

  const formatDateLabel = (isoDateString) => {
    if (!isoDateString) return 'Tarih Seçin';
    const date = new Date(isoDateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Bugün (' + date.toLocaleDateString('tr-TR') + ')';
    if (date.toDateString() === tomorrow.toDateString()) return 'Yarın (' + date.toLocaleDateString('tr-TR') + ')';
    
    return date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'long' });
  };

  const handleTimeChange = (text, type) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    
    // Saat kısmını kontrol et (00-23)
    if (cleaned.length >= 2) {
      let hours = parseInt(cleaned.slice(0, 2), 10);
      if (hours > 23) cleaned = '23' + cleaned.slice(2);
    }
    
    // Araya iki nokta koy
    if (cleaned.length >= 3) {
      cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
    }
    
    // Dakika kısmını kontrol et (00-59)
    if (cleaned.length >= 5) {
      let mins = parseInt(cleaned.slice(3, 5), 10);
      if (mins > 59) cleaned = cleaned.slice(0, 3) + '59';
    }

    if (type === 'departure') {
      setFormData(prev => ({...prev, time: cleaned}));
    } else {
      setFormData(prev => ({...prev, arrivalTime: cleaned}));
    }
  };

  const openModal = (trip = null) => {
    if (trip) {
      setEditingTrip(trip);
      const dDate = new Date(trip.departureTime);
      const aDate = new Date(trip.arrivalTime);
      
      const dateStr = dDate.toISOString().split('T')[0];
      const timeStr = dDate.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
      const aTimeStr = aDate.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});

      setFormData({ 
        departure: trip.origin, 
        destination: trip.destination, 
        date: dateStr, 
        time: timeStr, 
        arrivalTime: aTimeStr,
        price: trip.price.toString() 
      });
    } else {
      setEditingTrip(null);
      setFormData({ departure: '', destination: '', date: '', time: '', arrivalTime: '', price: '' });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.departure || !formData.destination || !formData.price || !formData.date || !formData.time || !formData.arrivalTime) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('trip2go_token');
      const payload = {
        company: adminCompany,
        type: adminType,
        seatLayout: adminType === 'flight' ? 'flight' : '2+1',
        departure: formData.departure,
        destination: formData.destination,
        date: formData.date,
        time: formData.time,
        arrivalTime: formData.arrivalTime,
        price: formData.price
      };

      if (editingTrip) {
        const res = await api.put(`/admin/trips/${editingTrip._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          Alert.alert('Başarılı', 'Sefer başarıyla güncellendi.');
          fetchTrips();
          setModalVisible(false);
        }
      } else {
        const res = await api.post('/admin/trips', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          Alert.alert('Başarılı', 'Yeni sefer eklendi.');
          fetchTrips();
          setModalVisible(false);
        }
      }
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.message || 'Kaydedilirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    const doDelete = async () => {
      try {
        const token = await AsyncStorage.getItem('trip2go_token');
        const res = await api.delete(`/admin/trips/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          Alert.alert('Silindi', 'Sefer başarıyla silindi.');
          fetchTrips();
        }
      } catch (err) {
        Alert.alert('Hata', 'Sefer silinirken bir hata oluştu.');
      }
    };

    Alert.alert('Emin misiniz?', 'Bu seferi tamamen silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: doDelete }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0b2261" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sefer Yönetimi</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Yeni Ekle</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {trips.length === 0 && !loading ? (
          <Text style={{textAlign: 'center', marginTop: 50, color: '#6b7280'}}>Henüz sefer eklemediniz.</Text>
        ) : null}
        {trips.map((trip) => {
          const dDate = new Date(trip.departureTime);
          const dateStr = dDate.toLocaleDateString('tr-TR');
          const timeStr = dDate.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
          return (
            <View key={trip._id} style={styles.tripCard}>
              <View style={styles.tripRow}>
                <Text style={styles.cityText}>{trip.origin} ➔ {trip.destination}</Text>
                <Text style={styles.priceText}>₺ {trip.price}</Text>
              </View>
              <View style={styles.tripRow}>
                <View>
                  <Text style={styles.detailText}>{dateStr} - {timeStr}</Text>
                  <Text style={{color: '#9ca3af', fontSize: 13, marginTop: 4}}>{trip.type === 'flight' ? 'Flight Standart' : `${trip.seatLayout || '2+2'} Standart`}</Text>
                </View>
                <View style={{flexDirection: 'row', gap: 8}}>
                  <TouchableOpacity style={styles.editButton} onPress={() => openModal(trip)}>
                    <Text style={styles.editButtonText}>Düzenle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.editButton, {backgroundColor: '#fee2e2'}]} onPress={() => handleDelete(trip._id)}>
                    <Text style={[styles.editButtonText, {color: '#ef4444'}]}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Ekleme / Düzenleme Modalı */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTrip ? 'Seferi Düzenle' : 'Yeni Sefer Ekle'}</Text>
            
            <TouchableOpacity style={[styles.input, {justifyContent: 'center'}]} onPress={() => openLocationModal('origin')}>
              <Text style={formData.departure ? {color: '#111827', fontSize: 16} : {color: '#9ca3af', fontSize: 16}}>{formData.departure || 'Kalkış Noktası Seçin'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.input, {justifyContent: 'center'}]} onPress={() => openLocationModal('destination')}>
              <Text style={formData.destination ? {color: '#111827', fontSize: 16} : {color: '#9ca3af', fontSize: 16}}>{formData.destination || 'Varış Noktası Seçin'}</Text>
            </TouchableOpacity>
            
            <View style={styles.rowInputs}>
              <TouchableOpacity style={[styles.input, {flex: 1, marginRight: 8, justifyContent: 'center'}]} onPress={() => setDateModalVisible(true)}>
                <Text style={formData.date ? {color: '#111827', fontSize: 16} : {color: '#9ca3af', fontSize: 16}}>{formData.date ? formatDateLabel(formData.date) : 'Tarih Seçin'}</Text>
              </TouchableOpacity>
              <TextInput style={[styles.input, {flex: 1, marginLeft: 8}]} placeholder="Kalkış (14:30)" keyboardType="numeric" maxLength={5} value={formData.time} onChangeText={t => handleTimeChange(t, 'departure')} />
            </View>
            
            <View style={styles.rowInputs}>
              <TextInput style={[styles.input, {flex: 1, marginRight: 8}]} placeholder="Varış (20:30)" keyboardType="numeric" maxLength={5} value={formData.arrivalTime} onChangeText={t => handleTimeChange(t, 'arrival')} />
              <TextInput style={[styles.input, {flex: 1, marginLeft: 8}]} placeholder="Fiyat (₺)" keyboardType="numeric" value={formData.price} onChangeText={t => setFormData({...formData, price: t})} />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)} disabled={saving}>
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Kaydet</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* LOCATION PICKER MODAL */}
      <Modal visible={locationModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setLocationModalVisible(false)}>
        <SafeAreaView style={styles.pickerSafeArea}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{locationSelectionType === 'origin' ? 'Kalkış Noktası Seçin' : 'Varış Noktası Seçin'}</Text>
            <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
              <Text style={styles.pickerCloseText}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pickerSearchContainer}>
            <TextInput 
              style={styles.pickerSearchInput} 
              placeholder="Şehir veya durak ara..." 
              value={locationSearchQuery}
              onChangeText={filterLocations}
              autoFocus={Platform.OS !== 'web'}
            />
          </View>
          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item._id || item.id || Math.random().toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.locationItem} onPress={() => selectLocation(item)}>
                <Text style={styles.locationCity}>{item.name}</Text>
                <Text style={styles.locationName}>{item.type === 'airport' ? 'Havalimanı' : 'Şehir / İlçe'}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 30, color: '#6b7280'}}>Sonuç bulunamadı.</Text>}
          />
        </SafeAreaView>
      </Modal>

      {/* DATE PICKER MODAL */}
      <Modal visible={dateModalVisible} animationType="slide" transparent={true} onRequestClose={() => setDateModalVisible(false)}>
        <View style={styles.bottomModalOverlay}>
          <View style={styles.bottomModalContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Tarih Seçin</Text>
              <TouchableOpacity onPress={() => setDateModalVisible(false)}>
                <Text style={styles.pickerCloseText}>Kapat</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={upcomingDates}
              keyExtractor={(item) => item.toISOString()}
              renderItem={({ item }) => {
                const isoStr = item.toISOString().split('T')[0];
                const isSelected = formData.date === isoStr;
                return (
                  <TouchableOpacity 
                    style={[styles.dateItem, isSelected && styles.dateItemSelected]} 
                    onPress={() => { setFormData(prev => ({...prev, date: isoStr})); setDateModalVisible(false); }}
                  >
                    <Text style={[styles.dateItemText, isSelected && styles.dateItemTextSelected]}>
                      {formatDateLabel(isoStr)}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f5f9' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f5f9' },
  container: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#0b2261' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  addButton: { backgroundColor: '#d33b2b', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  
  tripCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  tripRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cityText: { fontSize: 18, fontWeight: 'bold', color: '#0b2261' },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#d33b2b' },
  detailText: { fontSize: 14, color: '#6b7280' },
  editButton: { backgroundColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  editButtonText: { color: '#0b2261', fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0b2261', marginBottom: 20 },
  input: { backgroundColor: '#f4f5f9', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 16 },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelButton: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#e5e7eb', borderRadius: 10, marginRight: 8 },
  cancelButtonText: { color: '#374151', fontWeight: 'bold', fontSize: 16 },
  saveButton: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#d33b2b', borderRadius: 10, marginLeft: 8 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  pickerSafeArea: { flex: 1, backgroundColor: '#f4f5f9' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  pickerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  pickerCloseText: { fontSize: 16, color: '#d33b2b', fontWeight: '600' },
  pickerSearchContainer: { padding: 15, backgroundColor: '#fff' },
  pickerSearchInput: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, fontSize: 16 },
  locationItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
  locationCity: { fontSize: 16, fontWeight: '600', color: '#111827' },
  locationName: { fontSize: 13, color: '#6b7280', marginTop: 4 },

  bottomModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomModalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' },
  dateItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  dateItemSelected: { backgroundColor: '#eef2ff' },
  dateItemText: { fontSize: 16, color: '#374151', textAlign: 'center' },
  dateItemTextSelected: { color: '#0b2261', fontWeight: 'bold' }
});
