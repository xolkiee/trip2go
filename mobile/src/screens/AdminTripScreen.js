import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';

export default function AdminTripScreen() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null); // null means adding a new trip
  const [formData, setFormData] = useState({ origin: '', destination: '', date: '', time: '', price: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Mock Data Fetch
    setTimeout(() => {
      setTrips([
        { id: 1, origin: 'İstanbul', destination: 'Ankara', date: '2026-10-24', time: '14:30', price: '450' },
        { id: 2, origin: 'İzmir', destination: 'Antalya', date: '2026-10-25', time: '09:00', price: '600' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const openModal = (trip = null) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData({ origin: trip.origin, destination: trip.destination, date: trip.date, time: trip.time, price: trip.price.toString() });
    } else {
      setEditingTrip(null);
      setFormData({ origin: '', destination: '', date: '', time: '', price: '' });
    }
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.origin || !formData.destination || !formData.price) {
      Alert.alert('Uyarı', 'Lütfen kalkış, varış ve fiyat alanlarını doldurun.');
      return;
    }

    setSaving(true);
    // API İstek Simülasyonu
    setTimeout(() => {
      if (editingTrip) {
        // Düzenleme
        setTrips(trips.map(t => t.id === editingTrip.id ? { ...t, ...formData } : t));
        Alert.alert('Başarılı', 'Sefer başarıyla güncellendi.');
      } else {
        // Yeni Ekleme
        const newTrip = { id: Date.now(), ...formData };
        setTrips([...trips, newTrip]);
        Alert.alert('Başarılı', 'Yeni sefer eklendi.');
      }
      setSaving(false);
      setModalVisible(false);
    }, 1000);
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
        {trips.map((trip) => (
          <View key={trip.id} style={styles.tripCard}>
            <View style={styles.tripRow}>
              <Text style={styles.cityText}>{trip.origin} ➔ {trip.destination}</Text>
              <Text style={styles.priceText}>₺ {trip.price}</Text>
            </View>
            <View style={styles.tripRow}>
              <Text style={styles.detailText}>{trip.date} - {trip.time}</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => openModal(trip)}>
                <Text style={styles.editButtonText}>Düzenle</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Ekleme / Düzenleme Modalı */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTrip ? 'Seferi Düzenle' : 'Yeni Sefer Ekle'}</Text>
            
            <TextInput style={styles.input} placeholder="Kalkış Noktası (Örn: İstanbul)" value={formData.origin} onChangeText={t => setFormData({...formData, origin: t})} />
            <TextInput style={styles.input} placeholder="Varış Noktası (Örn: Ankara)" value={formData.destination} onChangeText={t => setFormData({...formData, destination: t})} />
            
            <View style={styles.rowInputs}>
              <TextInput style={[styles.input, {flex: 1, marginRight: 8}]} placeholder="Tarih (2026-10-24)" value={formData.date} onChangeText={t => setFormData({...formData, date: t})} />
              <TextInput style={[styles.input, {flex: 1, marginLeft: 8}]} placeholder="Saat (14:30)" value={formData.time} onChangeText={t => setFormData({...formData, time: t})} />
            </View>
            
            <TextInput style={styles.input} placeholder="Fiyat (Örn: 450)" keyboardType="numeric" value={formData.price} onChangeText={t => setFormData({...formData, price: t})} />

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
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
