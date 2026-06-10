import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function ReservationScreen() {
  const { tripId } = useLocalSearchParams();
  const [trip, setTrip] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingSeatId, setPendingSeatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchTripDetails();
    fetchReviews();
    fetchMyTickets();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      const response = await api.get(`/trips/${tripId}/details`);
      if (response.data.success) {
        setTrip(response.data.data);
        setSeats(response.data.data.seats);
      }
    } catch (error) {
      Alert.alert('Hata', 'Sefer detayları alınamadı.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/trip/${tripId}`);
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.log('Yorumlar çekilemedi');
    }
  };

  const fetchMyTickets = async () => {
    try {
      const token = await AsyncStorage.getItem('trip2go_token');
      const userStr = await AsyncStorage.getItem('trip2go_user');
      
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj.role === 'admin') setIsAdmin(true);
      }

      if (token) {
        const response = await api.get('/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.tickets) {
          const tripTickets = response.data.tickets.filter(t => t.trip && (t.trip._id === tripId || t.trip === tripId) && t.status !== 'cancelled');
          setMyTickets(tripTickets);
        }
      }
    } catch (error) {
      console.log('Biletler çekilemedi');
    }
  };

  const getSeatLayoutConfig = () => {
    if (!trip || !trip.seatLayout) return { columns: 4, is2Plus1: false };
    if (trip.type === 'flight' || trip.seatLayout === 'flight' || trip.seatLayout === '3+3') return { columns: 6, is2Plus1: false };
    if (trip.seatLayout === '2+1') return { columns: 3, is2Plus1: true };
    return { columns: 4, is2Plus1: false }; // 2+2 default
  };

  const handleSeatPress = (seatNumber) => {
    if (isAdmin) {
      Alert.alert('Yetkisiz İşlem', 'Yönetici hesapları bilet satın alamaz.');
      return;
    }
    const isAlreadySelected = selectedSeats.find(s => s.seatNumber === seatNumber);
    if (isAlreadySelected) {
      setSelectedSeats(selectedSeats.filter(s => s.seatNumber !== seatNumber));
      return;
    }
    if (selectedSeats.length >= 5) {
      Alert.alert('Limit Doldu', 'Tek seferde en fazla 5 koltuk seçebilirsiniz.');
      return;
    }
    setPendingSeatId(seatNumber);
    setModalVisible(true);
  };

  const handleGenderSelect = (gender) => {
    const { columns, is2Plus1 } = getSeatLayoutConfig();

    const getAdjacentSeatNumber = (seatNumber) => {
      if (trip && trip.type === 'flight') return null; // Uçaklarda cinsiyet yan yana kuralı genelde aranmaz
      
      if (is2Plus1) {
        if (seatNumber % 3 === 1) return null; // Tekli koltuk
        if (seatNumber % 3 === 2) return seatNumber + 1;
        if (seatNumber % 3 === 0) return seatNumber - 1;
      } else if (columns === 4) { // 2+2
        if (seatNumber % 4 === 1) return seatNumber + 1;
        if (seatNumber % 4 === 2) return seatNumber - 1;
        if (seatNumber % 4 === 3) return seatNumber + 1;
        if (seatNumber % 4 === 0) return seatNumber - 1;
      }
      return null;
    };

    const adjacentSeatNumber = getAdjacentSeatNumber(pendingSeatId);
    if (adjacentSeatNumber) {
      const adjacentSeat = seats.find(s => s.seatNumber === adjacentSeatNumber);
      if (adjacentSeat && (adjacentSeat.status === 'occupied' || adjacentSeat.status === 'reserved')) {
        const isMySeat = myTickets.some(t => t.seatNumber === adjacentSeatNumber);
        if (!isMySeat && adjacentSeat.gender && adjacentSeat.gender !== gender) {
          Alert.alert('Hata', `Bu koltuğun yanında bir ${adjacentSeat.gender === 'erkek' ? 'erkek' : 'kadın'} yolcu oturmaktadır. Farklı cinsiyette koltuk seçemezsiniz.`);
          return;
        }
      }
    }

    setSelectedSeats([...selectedSeats, { seatNumber: pendingSeatId, gender }]);
    setModalVisible(false);
    setPendingSeatId(null);
  };

  const calculateTotal = () => {
    if (!trip) return 0;
    const totalTicketPrice = trip.price * selectedSeats.length;
    const totalServiceFee = totalTicketPrice * 0.05;
    return totalTicketPrice + totalServiceFee;
  };

  const handleProceedToCheckout = async () => {
    if (selectedSeats.length === 0) return;
    
    setReserving(true);
    try {
      const token = await AsyncStorage.getItem('trip2go_token');
      if (!token) {
        Alert.alert('Giriş Yapın', 'Koltuk rezerve etmek için giriş yapmalısınız.');
        router.replace('/auth');
        return;
      }

      const response = await api.post('/reservations', {
        tripId: trip._id,
        seats: selectedSeats
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        router.push(`/checkout?reservationId=${response.data.data._id}`);
      } else {
        Alert.alert('Hata', response.data.message || 'Koltuk rezerve edilemedi.');
      }
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.message || 'Bağlantı hatası.');
    } finally {
      setReserving(false);
    }
  };

  if (loading || !trip) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#0b2261" />
      </View>
    );
  }

  const { columns, is2Plus1 } = getSeatLayoutConfig();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Sefer Kartı */}
        <View style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <Text style={styles.cityText} numberOfLines={2} adjustsFontSizeToFit>{trip.origin}</Text>
            <Text style={styles.arrowText}>➔</Text>
            <Text style={styles.cityText} numberOfLines={2} adjustsFontSizeToFit>{trip.destination}</Text>
          </View>
          <View style={styles.tripDetails}>
            <Text style={styles.detailText}>
              {new Date(trip.departureTime).toLocaleDateString('tr-TR')} | {new Date(trip.departureTime).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})} | {trip.company}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Koltuk Seçimi ({trip.seatLayout})</Text>
        <Text style={styles.subtitleText}>Lütfen seyahat etmek istediğiniz koltuğu seçin.</Text>

        <View style={styles.legendContainer}>
           <View style={styles.legendItem}><View style={[styles.legendBox, {backgroundColor: '#fff'}]} /><Text>Boş</Text></View>
           <View style={styles.legendItem}><View style={[styles.legendBox, {backgroundColor: '#bae6fd'}]} /><Text>Erkek</Text></View>
           <View style={styles.legendItem}><View style={[styles.legendBox, {backgroundColor: '#fbcfe8'}]} /><Text>Kadın</Text></View>
        </View>

        <View style={styles.busLayout}>
          <View style={styles.driverSection}><Text style={styles.driverText}>Şoför Mahalli</Text></View>
          <View style={[styles.seatsContainer, { width: (trip?.type === 'flight') ? (columns * 46) + 40 : (columns * 62) + 40 }]}>
            {seats.map((seat, index) => {
              const selSeat = selectedSeats.find(s => s.seatNumber === seat.seatNumber);
              const isSelected = !!selSeat;
              const isOccupied = seat.status === 'occupied' || seat.status === 'reserved';
              const isFlight = trip?.type === 'flight' || trip?.seatLayout === 'flight' || trip?.seatLayout === '3+3';

              let seatStyle = [styles.seat];
              let seatTextStyle = [styles.seatText];

              if (isFlight) {
                 seatStyle.push({ width: 40, height: 40, marginRight: 6 });
              }

              if (isOccupied) {
                if (seat.gender) {
                   seatStyle.push(seat.gender === 'erkek' ? styles.maleSeat : styles.femaleSeat);
                   seatTextStyle.push(styles.seatTextWhite);
                } else {
                   seatStyle.push({ backgroundColor: '#e5e7eb' });
                }
              } else if (isSelected) {
                seatStyle.push(selSeat.gender === 'erkek' ? styles.maleSeat : styles.femaleSeat);
                seatStyle.push(styles.selectedBorder);
                seatTextStyle.push(styles.seatTextWhite);
              } else {
                seatStyle.push(styles.seatAvailable);
              }

              // Koridor boşluğu ekleme mantığı
              if (isFlight && (index + 1) % columns === 3) {
                 seatStyle.push({ marginRight: 20 }); // 3+3 uçak koridor
              } else if (trip.seatLayout === '2+1' && (index + 1) % columns === 1) {
                 seatStyle.push({ marginRight: 40 }); // Koridor
              } else if (trip.seatLayout === '2+2' && (index + 1) % columns === 2) {
                 seatStyle.push({ marginRight: 40 }); // 2+2 koridor
              }

              return (
                <TouchableOpacity
                  key={seat.seatNumber}
                  style={seatStyle}
                  disabled={isOccupied}
                  onPress={() => handleSeatPress(seat.seatNumber)}
                >
                  <Text style={seatTextStyle}>{seat.seatNumber}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sepet Özeti */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Sefer Özeti</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Birim Bilet Tutarı</Text>
            <Text style={styles.summaryVal}>{trip.price} ₺</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Birim Hizmet Bedeli</Text>
            <Text style={styles.summaryVal}>{trip.price * 0.05} ₺</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 10 }]}>
            <Text style={[styles.summaryText, {fontWeight: 'bold'}]}>Seçili Koltuklar</Text>
            <Text style={[styles.summaryVal, {color: '#0b2261'}]}>{selectedSeats.length > 0 ? selectedSeats.map(s => s.seatNumber).join(', ') : '-'}</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 10 }]}>
            <Text style={styles.summaryTotalText}>Toplam Tutar</Text>
            <Text style={styles.summaryTotalVal}>{calculateTotal()} ₺</Text>
          </View>

          {isAdmin ? (
            <View style={{backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginTop: 15}}>
              <Text style={{color: '#ef4444', textAlign: 'center', fontWeight: 'bold'}}>Yönetici hesabı ile bilet satın alınamaz.</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.checkoutButton, selectedSeats.length === 0 && styles.checkoutButtonDisabled]} 
              onPress={handleProceedToCheckout}
              disabled={selectedSeats.length === 0 || reserving}
            >
              {reserving ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkoutButtonText}>
                {selectedSeats.length > 0 ? 'Ödemeye İlerle' : 'Lütfen Koltuk Seçin'}
              </Text>}
            </TouchableOpacity>
          )}
        </View>
        
        {/* Yolcu Değerlendirmeleri */}
        <View style={styles.reviewsCard}>
          <Text style={styles.reviewsTitle}>Yolcu Değerlendirmeleri ({reviews.length})</Text>
          {reviews.length === 0 ? (
             <Text style={styles.noReviewText}>Bu sefer için henüz değerlendirme yapılmamış.</Text>
          ) : (
             reviews.map((r, index) => (
               <View key={r.id || index} style={[styles.reviewItem, index === reviews.length - 1 && { borderBottomWidth: 0 }]}>
                 <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{r.maskedUser}</Text>
                    <Text style={styles.stars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
                 </View>
                 <Text style={styles.reviewText}>"{r.comment}"</Text>
               </View>
             ))
          )}
        </View>

      </ScrollView>

      {/* Modal */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yolcu Cinsiyeti</Text>
            <Text style={styles.modalSubTitle}>Lütfen {pendingSeatId} numaralı koltuk için yolcu cinsiyetini seçiniz.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.genderBtn, {backgroundColor: '#bae6fd'}]} onPress={() => handleGenderSelect('erkek')}>
                <Text style={styles.genderBtnText}>Erkek</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.genderBtn, {backgroundColor: '#fbcfe8'}]} onPress={() => handleGenderSelect('kadin')}>
                <Text style={styles.genderBtnText}>Kadın</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelModalBtnText}>İptal Et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f5f9' },
  container: { padding: 20, paddingBottom: 40 },
  tripCard: { backgroundColor: '#0b2261', padding: 24, borderRadius: 16, marginBottom: 20 },
  tripHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cityText: { fontSize: 24, fontWeight: 'bold', color: '#fff', flexShrink: 1 },
  arrowText: { fontSize: 20, color: '#d1d5db', marginHorizontal: 15 },
  tripDetails: {},
  detailText: { color: '#d1d5db', fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#0b2261', marginBottom: 4 },
  subtitleText: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  legendContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  legendBox: { width: 16, height: 16, borderRadius: 4, marginRight: 6, borderWidth: 1, borderColor: '#d1d5db' },
  busLayout: { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  driverSection: { width: '100%', padding: 12, backgroundColor: '#f4f5f9', borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  driverText: { color: '#6b7280', fontWeight: '500' },
  seatsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  seat: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginBottom: 12, marginRight: 12, borderWidth: 2, borderColor: 'transparent' },
  seatAvailable: { backgroundColor: '#fff', borderColor: '#d1d5db' },
  maleSeat: { backgroundColor: '#bae6fd' },
  femaleSeat: { backgroundColor: '#fbcfe8' },
  selectedBorder: { borderColor: '#0b2261', borderWidth: 3 },
  seatText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  seatTextWhite: { fontSize: 16, fontWeight: '600', color: '#0b2261' },
  summaryCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#0b2261', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryText: { color: '#4b5563', fontSize: 15 },
  summaryVal: { color: '#111827', fontSize: 15, fontWeight: '600' },
  summaryTotalText: { color: '#111827', fontSize: 18, fontWeight: 'bold' },
  summaryTotalVal: { color: '#d33b2b', fontSize: 22, fontWeight: 'bold' },
  checkoutButton: { backgroundColor: '#d33b2b', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  checkoutButtonDisabled: { backgroundColor: '#e5e7eb' },
  checkoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0b2261', marginBottom: 8 },
  modalSubTitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 },
  genderBtn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', marginHorizontal: 8 },
  genderBtnText: { color: '#0b2261', fontWeight: 'bold', fontSize: 16 },
  cancelModalBtn: { padding: 10 },
  cancelModalBtnText: { color: '#6b7280', fontWeight: 'bold' },
  reviewsCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginTop: 20, elevation: 3 },
  reviewsTitle: { fontSize: 18, fontWeight: 'bold', color: '#0b2261', marginBottom: 15 },
  reviewItem: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 15, marginBottom: 15 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewerName: { fontWeight: 'bold', color: '#111827' },
  stars: { color: '#f59e0b', fontSize: 16 },
  reviewText: { color: '#4b5563', fontStyle: 'italic', fontSize: 14 },
  noReviewText: { color: '#6b7280', fontStyle: 'italic' }
});
