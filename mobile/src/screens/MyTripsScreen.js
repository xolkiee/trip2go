import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function MyTripsScreen() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = await AsyncStorage.getItem('trip2go_token');
      if (!token) return;
      const response = await api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.tickets) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.log('Biletleri çekerken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (ticketId) => {
    const doCancel = async () => {
      try {
        const token = await AsyncStorage.getItem('trip2go_token');
        await api.delete(`/tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert('İptal Edildi', 'Biletiniz başarıyla iptal edildi.');
        fetchTickets();
      } catch (err) {
        Alert.alert('Hata', 'Bilet iptal edilirken bir sorun oluştu.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Biletinizi iptal etmek istediğinize emin misiniz? İade koşulları geçerli olacaktır.')) {
        doCancel();
      }
    } else {
      Alert.alert('Bileti İptal Et', 'Biletinizi iptal etmek istediğinize emin misiniz? İade koşulları geçerli olacaktır.', [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Evet, İptal Et', style: 'destructive', onPress: doCancel }
      ]);
    }
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

        {tickets.length === 0 && (
          <Text style={{textAlign: 'center', marginTop: 20}}>Henüz biletiniz bulunmuyor.</Text>
        )}

        {tickets.map((ticket) => {
          if (!ticket.trip) return null;
          const trip = ticket.trip;
          const isCancelled = ticket.status === 'cancelled';
          const isCompleted = new Date(trip.arrivalTime) <= new Date() && !isCancelled;
          const isActive = new Date(trip.departureTime) > new Date() && !isCancelled;
          
          let statusText = 'Bilinmiyor';
          let badgeStyle = styles.doneBadge;
          let statusTextStyle = styles.statusText;

          if (isCancelled) {
            statusText = 'İptal Edildi';
            badgeStyle = styles.cancelBadge;
            statusTextStyle = {color: '#fff', fontSize: 12, fontWeight: 'bold'};
          } else if (isCompleted) {
            statusText = 'Tamamlandı';
            badgeStyle = styles.doneBadge;
          } else if (isActive) {
            statusText = 'Sefer Bekleniyor';
            badgeStyle = styles.activeBadge;
          } else {
            statusText = 'Sefer Gerçekleşiyor';
            badgeStyle = styles.activeBadge;
          }

          return (
            <View key={ticket._id} style={[styles.ticketCard, isCancelled && styles.cancelledCard]}>
              <View style={styles.ticketHeader}>
                <Text style={styles.cityText}>{trip.origin} ➔ {trip.destination}</Text>
                <View style={[styles.statusBadge, badgeStyle]}>
                  <Text style={statusTextStyle}>{statusText}</Text>
                </View>
              </View>
              
              <View style={styles.ticketDetails}>
                <Text style={styles.detailText}>Tarih: {new Date(trip.departureTime).toLocaleDateString()} - {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                <Text style={styles.detailText}>Koltuk: <Text style={styles.seatText}>{ticket.seatNumber}</Text></Text>
                <Text style={styles.detailText}>Yolcu: {ticket.passenger?.firstName} {ticket.passenger?.lastName}</Text>
              </View>

              {isActive && (
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(ticket._id)}>
                    <Text style={styles.cancelButtonText}>Bileti İptal Et</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editButton} onPress={() => Alert.alert('Bilgi', 'Yolcu bilgisi güncelleme işlemi sadece web üzerinden yapılabilir.')}>
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
