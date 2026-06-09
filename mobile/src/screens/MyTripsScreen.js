import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, TextInput } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import AuthScreen from './AuthScreen';

export default function MyTripsScreen() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [reviews, setReviews] = useState({});
  const [activeReviewTripId, setActiveReviewTripId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [])
  );

  const fetchTickets = async () => {
    try {
      const token = await AsyncStorage.getItem('trip2go_token');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
      setIsLoggedIn(true);

      const userStr = await AsyncStorage.getItem('trip2go_user');
      const user = userStr ? JSON.parse(userStr) : { firstName: 'Misafir', lastName: 'Kullanıcı' };
      const userId = `${user.firstName} ${user.lastName}`;

      const response = await api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.tickets) {
        setTickets(response.data.tickets);

        const uniqueTrips = [...new Set(response.data.tickets.filter(t => t.trip).map(t => t.trip._id))];
        for (const tripId of uniqueTrips) {
          const rRes = await api.get(`/reviews/trip/${tripId}`);
          if (rRes.data.success) {
            const userReview = rRes.data.data.find(r => r.userId === userId && r.tripId === tripId);
            if (userReview) {
              setReviews(prev => ({ ...prev, [tripId]: userReview }));
            }
          }
        }
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

  const handleOpenReview = (tripId, existingReview = null) => {
    setActiveReviewTripId(tripId);
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    } else {
      setRating(5);
      setComment('');
    }
  };

  const handleSubmitReview = async () => {
    const userStr = await AsyncStorage.getItem('trip2go_user');
    const user = userStr ? JSON.parse(userStr) : { firstName: 'Misafir', lastName: 'Kullanıcı' };
    const userId = `${user.firstName} ${user.lastName}`; 

    const existingReview = reviews[activeReviewTripId];
    try {
      if (existingReview) {
        const res = await api.put(`/reviews/${existingReview.id}`, { rating, comment });
        if (res.data.success) {
          setReviews(prev => ({ ...prev, [activeReviewTripId]: res.data.data }));
          setActiveReviewTripId(null);
        } else Alert.alert('Hata', res.data.message);
      } else {
        const res = await api.post('/reviews', { tripId: activeReviewTripId, userId, rating, comment });
        if(res.data.success) {
          setReviews(prev => ({ ...prev, [activeReviewTripId]: res.data.data }));
          setActiveReviewTripId(null);
        } else Alert.alert('Hata', res.data.message);
      }
    } catch(err) {
      console.log(err);
      Alert.alert('Hata', 'Değerlendirme kaydedilemedi.');
    }
  };

  const handleDeleteReview = (tripId, reviewId) => {
    const doDelete = async () => {
      try {
        const res = await api.delete(`/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${await AsyncStorage.getItem('trip2go_token')}` }
        });
        if (res.data.success) {
          const newReviews = {...reviews};
          delete newReviews[tripId];
          setReviews(newReviews);
          Alert.alert('Başarılı', 'Yorum başarıyla silindi.');
        }
      } catch(err) {
        console.log(err);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Yorumunuzu kalıcı olarak silmek istediğinize emin misiniz?')) {
        doDelete();
      }
    } else {
      Alert.alert('Sil', 'Yorumunuzu kalıcı olarak silmek istediğinize emin misiniz?', [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Evet, Sil', style: 'destructive', onPress: doDelete }
      ]);
    }
  };

  const renderStars = (currentRating, onSelect) => {
    return (
      <View style={{flexDirection: 'row', marginBottom: 15, justifyContent: 'center'}}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => onSelect && onSelect(star)}>
            <Text style={{fontSize: 30, color: star <= currentRating ? '#f59e0b' : '#d1d5db', marginHorizontal: 5}}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
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
          fetchTickets();
        }} 
      />
    );
  }

  const now = new Date();

  const groupedTrips = tickets.reduce((groups, ticket) => {
     if (!ticket.trip) return groups;
     const tripId = ticket.trip._id;
     if (!groups[tripId]) {
        groups[tripId] = { trip: ticket.trip, tickets: [] };
     }
     groups[tripId].tickets.push(ticket);
     return groups;
  }, {});

  const tripGroupsArray = Object.values(groupedTrips).sort((a,b) => new Date(b.trip.departureTime) - new Date(a.trip.departureTime));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Biletlerim</Text>

        {tripGroupsArray.length === 0 && (
          <Text style={{textAlign: 'center', marginTop: 20}}>Henüz biletiniz bulunmuyor.</Text>
        )}

        {tripGroupsArray.map((group) => {
          const trip = group.trip;
          const groupTickets = group.tickets;

          const allCancelled = groupTickets.every(t => t.status === 'cancelled');
          const isCompleted = new Date(trip.arrivalTime) <= now && !allCancelled;
          const isPending = new Date(trip.departureTime) > now && !allCancelled;
          const isInProgress = new Date(trip.departureTime) <= now && new Date(trip.arrivalTime) > now && !allCancelled;
          const userReview = reviews[trip._id];
          
          let statusText = 'Bilinmiyor';
          let badgeStyle = styles.doneBadge;
          let statusTextStyle = styles.statusText;

          if (allCancelled) {
            statusText = 'İptal Edildi';
            badgeStyle = styles.cancelBadge;
            statusTextStyle = {color: '#fff', fontSize: 12, fontWeight: 'bold'};
          } else if (isCompleted) {
            statusText = 'Sefer Tamamlandı';
            badgeStyle = styles.doneBadge;
            statusTextStyle = {color: '#10b981', fontSize: 12, fontWeight: 'bold'};
          } else if (isPending) {
            statusText = 'Sefer Bekleniyor';
            badgeStyle = styles.activeBadge;
            statusTextStyle = {color: '#10b981', fontSize: 12, fontWeight: 'bold'};
          } else {
            statusText = 'Sefer Gerçekleşiyor';
            badgeStyle = styles.activeBadge;
            statusTextStyle = {color: '#10b981', fontSize: 12, fontWeight: 'bold'};
          }

          return (
            <View key={trip._id} style={[styles.ticketCard, allCancelled && styles.cancelledCard]}>
              <View style={styles.ticketHeader}>
                <View style={{flex: 1, paddingRight: 10}}>
                  <Text style={styles.cityText}>{trip.company} | {trip.origin} ➔ {trip.destination}</Text>
                  <Text style={styles.detailText}>{new Date(trip.departureTime).toLocaleDateString()} - {new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                </View>
                <View style={[styles.statusBadge, badgeStyle]}>
                  <Text style={statusTextStyle}>{statusText}</Text>
                </View>
              </View>
              
              <View style={{ marginTop: 15, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 15 }}>
                <Text style={{ marginBottom: 10, color: '#334155', fontWeight: 'bold' }}>Yolcu Bilgileri</Text>
                {groupTickets.map(ticket => {
                  const isTicketCancelled = ticket.status === 'cancelled';
                  return (
                    <View key={ticket._id} style={styles.passengerRow}>
                      <View style={{flex: 1}}>
                        <Text style={styles.passengerText}>
                          Yolcu: <Text style={{fontWeight:'normal'}}>{ticket.passenger?.firstName} {ticket.passenger?.lastName}</Text> | Koltuk No: <Text style={{fontWeight:'bold'}}>{ticket.seatNumber}</Text>
                        </Text>
                        {isTicketCancelled && <Text style={styles.cancelledText}>(İptal Edildi)</Text>}
                      </View>
                      {!isTicketCancelled && isPending && (
                         <View style={{flexDirection: 'row', gap: 8}}>
                           <TouchableOpacity style={[styles.miniBtn, {backgroundColor: '#eef2ff'}]} onPress={() => Alert.alert('Bilgi', 'Yolcu bilgisi güncelleme işlemi sadece web üzerinden yapılabilir.')}>
                             <Text style={[styles.miniBtnText, {color: '#4f46e5'}]}>Güncelle</Text>
                           </TouchableOpacity>
                           <TouchableOpacity style={[styles.miniBtn, {backgroundColor: '#fee2e2'}]} onPress={() => handleCancel(ticket._id)}>
                             <Text style={[styles.miniBtnText, {color: '#ef4444'}]}>İptal Et</Text>
                           </TouchableOpacity>
                         </View>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Değerlendirme Kısmı */}
              {isCompleted && (
                <View style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 15, paddingTop: 15 }}>
                  {userReview ? (
                    <View>
                      <Text style={{fontWeight: 'bold', marginBottom: 5}}>Puanınız: <Text style={{color: '#f59e0b'}}>{'★'.repeat(userReview.rating)}{'☆'.repeat(5-userReview.rating)}</Text></Text>
                      <Text style={{fontStyle: 'italic', color: '#475569', marginBottom: 10}}>"{userReview.comment}"</Text>
                      <View style={{flexDirection: 'row', gap: 10}}>
                        <TouchableOpacity style={[styles.miniBtn, {backgroundColor: '#eef2ff'}]} onPress={() => handleOpenReview(trip._id, userReview)}>
                          <Text style={[styles.miniBtnText, {color: '#4f46e5'}]}>Yorumu Düzenle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.miniBtn, {backgroundColor: '#fee2e2'}]} onPress={() => handleDeleteReview(trip._id, userReview.id)}>
                          <Text style={[styles.miniBtnText, {color: '#ef4444'}]}>Yorumu Sil</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.rateBtn} onPress={() => handleOpenReview(trip._id)}>
                      <Text style={styles.rateBtnText}>Seferi Değerlendir</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Yorum Formu */}
              {activeReviewTripId === trip._id && (
                <View style={styles.reviewForm}>
                  <Text style={{fontWeight: 'bold', fontSize: 16, marginBottom: 10, textAlign: 'center'}}>
                    {userReview ? 'Değerlendirmeyi Güncelle' : 'Yolculuğunuz nasıldı?'}
                  </Text>
                  {renderStars(rating, setRating)}
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Görüşleriniz bizim için değerli..."
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    numberOfLines={3}
                  />
                  <View style={{flexDirection: 'row', gap: 10, justifyContent: 'flex-end'}}>
                    <TouchableOpacity style={styles.cancelReviewBtn} onPress={() => setActiveReviewTripId(null)}>
                      <Text style={styles.cancelReviewText}>İptal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveReviewBtn} onPress={handleSubmitReview}>
                      <Text style={styles.saveReviewText}>{userReview ? 'Güncelle' : 'Gönder'}</Text>
                    </TouchableOpacity>
                  </View>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f5f9' },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0b2261', marginBottom: 20 },
  
  ticketCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cancelledCard: { opacity: 0.7 },
  
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  cityText: { fontSize: 16, fontWeight: 'bold', color: '#0b2261', marginBottom: 4 },
  detailText: { fontSize: 13, color: '#6b7280' },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 2 },
  activeBadge: { backgroundColor: '#e6f4ea' },
  doneBadge: { backgroundColor: '#f3f4f6' },
  cancelBadge: { backgroundColor: '#d33b2b' },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#10b981' },
  
  passengerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  passengerText: { fontSize: 14, color: '#475569', fontWeight: 'bold' },
  cancelledText: { fontSize: 12, color: '#ef4444', fontWeight: 'bold', marginTop: 2 },
  
  miniBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  miniBtnText: { fontWeight: 'bold', fontSize: 12 },

  rateBtn: { backgroundColor: '#d33b2b', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  rateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  reviewForm: { marginTop: 15, backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  reviewInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, textAlignVertical: 'top', height: 80, marginBottom: 15 },
  cancelReviewBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  cancelReviewText: { color: '#64748b', fontWeight: 'bold' },
  saveReviewBtn: { backgroundColor: '#0b2261', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  saveReviewText: { color: '#fff', fontWeight: 'bold' }
});
