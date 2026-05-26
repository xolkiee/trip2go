import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

export default function MyTripsScreen() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setTrips([
        { id: 1, origin: 'İstanbul', destination: 'Ankara', date: '2026-10-24', time: '14:30', seat: '2A', status: 'Sefer Bekleniyor' },
        { id: 2, origin: 'İzmir', destination: 'Antalya', date: '2026-05-10', time: '09:00', seat: '4B', status: 'Tamamlandı' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCancel = (id) => {
    Alert.alert('Bileti İptal Et', 'Biletinizi iptal etmek istediğinize emin misiniz? İade koşulları geçerli olacaktır.', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Evet, İptal Et', style: 'destructive', onPress: () => {
          setTrips(trips.map(t => t.id === id ? { ...t, status: 'İptal Edildi' } : t));
          Alert.alert('İptal Edildi', 'Biletiniz başarıyla iptal edildi.');
      }}
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0b2261" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Biletlerim</Text>

        {trips.map((trip) => {
          const isActive = trip.status === 'Sefer Bekleniyor';
          const isCancelled = trip.status === 'İptal Edildi';

          return (
            <View key={trip.id} style={[styles.ticketCard, isCancelled && styles.cancelledCard]}>
              <View style={styles.ticketHeader}>
                <Text style={styles.cityText}>{trip.origin} ➔ {trip.destination}</Text>
                <View style={[styles.statusBadge, isActive ? styles.activeBadge : (isCancelled ? styles.cancelBadge : styles.doneBadge)]}>
                  <Text style={[styles.statusText, isCancelled && {color: '#fff'}]}>{trip.status}</Text>
                </View>
              </View>
              
              <View style={styles.ticketDetails}>
                <Text style={styles.detailText}>Tarih: {trip.date} - {trip.time}</Text>
                <Text style={styles.detailText}>Koltuk: <Text style={styles.seatText}>{trip.seat}</Text></Text>
              </View>

              {isActive && (
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(trip.id)}>
                    <Text style={styles.cancelButtonText}>Bileti İptal Et</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editButton} onPress={() => Alert.alert('Yolcu Bilgisi', 'Yolcu güncelleme ekranı açılıyor...')}>
                    <Text style={styles.editButtonText}>Yolcu Güncelle</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f5f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f5f9' },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0b2261', marginBottom: 20 },
  
  ticketCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cancelledCard: { opacity: 0.7 },
  
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cityText: { fontSize: 18, fontWeight: 'bold', color: '#0b2261' },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  activeBadge: { backgroundColor: '#e6f4ea' },
  doneBadge: { backgroundColor: '#f3f4f6' },
  cancelBadge: { backgroundColor: '#d33b2b' },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#10b981' },
  
  ticketDetails: { marginBottom: 16 },
  detailText: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  seatText: { fontWeight: 'bold', color: '#0b2261' },
  
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 16, justifyContent: 'space-between' },
  cancelButton: { flex: 1, alignItems: 'center', padding: 10, backgroundColor: '#fef2f2', borderRadius: 8, marginRight: 8 },
  cancelButtonText: { color: '#d33b2b', fontWeight: 'bold' },
  editButton: { flex: 1, alignItems: 'center', padding: 10, backgroundColor: '#eef2ff', borderRadius: 8, marginLeft: 8 },
  editButtonText: { color: '#0b2261', fontWeight: 'bold' }
});
