import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, Modal, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

export default function ReservationScreen() {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingSeatId, setPendingSeatId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Gelişmiş koltuk verisi (Cinsiyet ve Partner bilgisi ile)
  const [seats, setSeats] = useState([
    { id: '1A', pair: '1B', status: 'available', gender: null }, { id: '1B', pair: '1A', status: 'occupied', gender: 'kadin' },
    { id: '2A', pair: '2B', status: 'available', gender: null }, { id: '2B', pair: '2A', status: 'available', gender: null },
    { id: '3A', pair: '3B', status: 'occupied', gender: 'erkek' }, { id: '3B', pair: '3A', status: 'available', gender: null },
    { id: '4A', pair: '4B', status: 'available', gender: null }, { id: '4B', pair: '4A', status: 'available', gender: null },
  ]);

  const basePrice = 450;
  const serviceFeePercent = 0.05;

  const handleSeatPress = (seatId) => {
    // Zaten seçiliyse iptal et
    const isAlreadySelected = selectedSeats.find(s => s.seatNumber === seatId);
    if (isAlreadySelected) {
      setSelectedSeats(selectedSeats.filter(s => s.seatNumber !== seatId));
      return;
    }

    if (selectedSeats.length >= 5) {
      Alert.alert('Limit Doldu', 'Tek seferde en fazla 5 koltuk seçebilirsiniz.');
      return;
    }

    setPendingSeatId(seatId);
    setModalVisible(true);
  };

  const handleGenderSelect = (gender) => {
    // Yan yana oturma kuralı kontrolü
    const targetSeat = seats.find(s => s.id === pendingSeatId);
    const pairSeatInfo = seats.find(s => s.id === targetSeat.pair);
    
    // Eğer partner koltuk "occupied" ise ve cinsiyet zıtsa, hata ver
    if (pairSeatInfo && pairSeatInfo.status === 'occupied' && pairSeatInfo.gender && pairSeatInfo.gender !== gender) {
      Alert.alert('Kural İhlali', 'Aynı çiftli koltukta zıt cinsiyetler yan yana oturamaz.');
      setModalVisible(false);
      setPendingSeatId(null);
      return;
    }
    
    // Eğer partner koltuk bizim tarafımızdan "selected" ise ve cinsiyet zıtsa, yine hata ver
    const pairSelected = selectedSeats.find(s => s.seatNumber === targetSeat.pair);
    if (pairSelected && pairSelected.gender !== gender) {
      Alert.alert('Kural İhlali', 'Aynı çiftli koltukta zıt cinsiyetler yan yana oturamaz.');
      setModalVisible(false);
      setPendingSeatId(null);
      return;
    }

    setSelectedSeats([...selectedSeats, { seatNumber: pendingSeatId, gender }]);
    setModalVisible(false);
    setPendingSeatId(null);
  };

  const calculateTotal = () => {
    const totalTicketPrice = basePrice * selectedSeats.length;
    const totalServiceFee = totalTicketPrice * serviceFeePercent;
    return totalTicketPrice + totalServiceFee;
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) return;
    setLoading(true);
    // Simüle etme
    setTimeout(() => {
      setLoading(false);
      router.push(`/checkout?seats=${encodeURIComponent(JSON.stringify(selectedSeats))}`);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Sefer Kartı */}
        <View style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <Text style={styles.cityText}>İstanbul</Text>
            <Text style={styles.arrowText}>➔</Text>
            <Text style={styles.cityText}>Ankara</Text>
          </View>
          <View style={styles.tripDetails}>
            <Text style={styles.detailText}>24 Ekim 2026 | 14:30 | Trip2Go Turizm</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Koltuk Seçimi</Text>
        <Text style={styles.subtitleText}>Lütfen seyahat etmek istediğiniz koltuğu seçin.</Text>

        <View style={styles.legendContainer}>
           <View style={styles.legendItem}><View style={[styles.legendBox, {backgroundColor: '#fff'}]} /><Text>Boş</Text></View>
           <View style={styles.legendItem}><View style={[styles.legendBox, {backgroundColor: '#bae6fd'}]} /><Text>Erkek</Text></View>
           <View style={styles.legendItem}><View style={[styles.legendBox, {backgroundColor: '#fbcfe8'}]} /><Text>Kadın</Text></View>
        </View>

        <View style={styles.busLayout}>
          <View style={styles.driverSection}><Text style={styles.driverText}>Şoför Mahalli</Text></View>
          <View style={styles.seatsContainer}>
            {seats.map((seat) => {
              const selSeat = selectedSeats.find(s => s.seatNumber === seat.id);
              const isSelected = !!selSeat;
              const isOccupied = seat.status === 'occupied';

              let seatStyle = [styles.seat];
              let seatTextStyle = [styles.seatText];

              if (isOccupied) {
                seatStyle.push(seat.gender === 'erkek' ? styles.maleSeat : styles.femaleSeat);
                seatTextStyle.push(styles.seatTextWhite);
              } else if (isSelected) {
                seatStyle.push(selSeat.gender === 'erkek' ? styles.maleSeat : styles.femaleSeat);
                seatStyle.push(styles.selectedBorder);
                seatTextStyle.push(styles.seatTextWhite);
              } else {
                seatStyle.push(styles.seatAvailable);
              }

              return (
                <TouchableOpacity
                  key={seat.id}
                  style={seatStyle}
                  disabled={isOccupied}
                  onPress={() => handleSeatPress(seat.id)}
                >
                  <Text style={seatTextStyle}>{seat.id}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sepet Özeti Kartı */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Sefer Özeti</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Birim Bilet Tutarı</Text>
            <Text style={styles.summaryVal}>{basePrice} ₺</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Birim Hizmet Bedeli</Text>
            <Text style={styles.summaryVal}>{basePrice * serviceFeePercent} ₺</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 10 }]}>
            <Text style={[styles.summaryText, {fontWeight: 'bold'}]}>Seçili Koltuklar</Text>
            <Text style={[styles.summaryVal, {color: '#0b2261'}]}>{selectedSeats.length > 0 ? selectedSeats.map(s => s.seatNumber).join(', ') : '-'}</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 10 }]}>
            <Text style={styles.summaryTotalText}>Toplam Tutar</Text>
            <Text style={styles.summaryTotalVal}>{calculateTotal()} ₺</Text>
          </View>

          <TouchableOpacity 
            style={[styles.checkoutButton, selectedSeats.length === 0 && styles.checkoutButtonDisabled]} 
            onPress={handleProceedToCheckout}
            disabled={selectedSeats.length === 0 || loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkoutButtonText}>
              {selectedSeats.length > 0 ? 'Ödemeye İlerle' : 'Lütfen Koltuk Seçin'}
            </Text>}
          </TouchableOpacity>
        </View>

        {/* Yolcu Değerlendirmeleri */}
        <View style={styles.reviewsCard}>
          <Text style={styles.reviewsTitle}>Yolcu Değerlendirmeleri (3)</Text>
          <View style={styles.reviewItem}>
             <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>Ö*** A***</Text>
                <Text style={styles.stars}>★★★★★</Text>
             </View>
             <Text style={styles.reviewText}>"Harika bir yolculuktu, koltuklar çok rahattı. Şoför gayet profesyoneldi."</Text>
          </View>
          <View style={styles.reviewItem}>
             <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>F*** B***</Text>
                <Text style={styles.stars}>★★★★☆</Text>
             </View>
             <Text style={styles.reviewText}>"Genel olarak iyiydi fakat 15 dakika rötar yaptı."</Text>
          </View>
          <View style={[styles.reviewItem, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
             <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>A*** Y***</Text>
                <Text style={styles.stars}>★★★★★</Text>
             </View>
             <Text style={styles.reviewText}>"Çok memnun kaldım, ikramlar da güzeldi."</Text>
          </View>
        </View>

      </ScrollView>

      {/* Cinsiyet Seçim Modalı */}
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
  cityText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
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
  seatsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: 200 },
  
  seat: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 16, marginBottom: 16, borderWidth: 2, borderColor: 'transparent' },
  seatAvailable: { backgroundColor: '#fff', borderColor: '#d1d5db' },
  maleSeat: { backgroundColor: '#bae6fd' },
  femaleSeat: { backgroundColor: '#fbcfe8' },
  selectedBorder: { borderColor: '#0b2261', borderWidth: 3 },
  seatText: { fontSize: 18, fontWeight: '600', color: '#111827' },
  seatTextWhite: { fontSize: 18, fontWeight: '600', color: '#0b2261' },

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

  reviewsCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginTop: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  reviewsTitle: { fontSize: 18, fontWeight: 'bold', color: '#0b2261', marginBottom: 15 },
  reviewItem: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 15, marginBottom: 15 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewerName: { fontWeight: 'bold', color: '#111827' },
  stars: { color: '#f59e0b', fontSize: 16 },
  reviewText: { color: '#4b5563', fontStyle: 'italic', fontSize: 14 }
});
