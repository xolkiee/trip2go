import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function CheckoutScreen() {
  const { seats } = useLocalSearchParams();
  const parsedSeats = seats ? JSON.parse(seats) : [];
  
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [loading, setLoading] = useState(false);
  const [passengers, setPassengers] = useState(parsedSeats.map(s => ({
    seatNumber: s.seatNumber,
    gender: s.gender,
    firstName: '', lastName: '', identityNumber: '', contactPhone: ''
  })));
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvv: '' });

  // 10 dk Sayaç
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          Alert.alert('Süre Doldu', 'Rezervasyon süreniz doldu, lütfen tekrar deneyin.', [
            { text: 'Tamam', onPress: () => router.back() }
          ]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePassengerChange = (index, field, val) => {
    const newPass = [...passengers];
    newPass[index][field] = val;
    setPassengers(newPass);
  };

  const handleIdentityChange = (index, text) => {
    const numericVal = text.replace(/\D/g, '').slice(0, 11);
    handlePassengerChange(index, 'identityNumber', numericVal);
  };

  const handlePhoneChange = (index, text) => {
    // Basic formatting for 05xx xxx xx xx
    let val = text.replace(/\D/g, '');
    if (val.length > 0 && val[0] !== '0') val = '0' + val;
    if (val.length > 11) val = val.slice(0, 11);
    
    let formatted = val;
    if (val.length > 3 && val.length <= 6) formatted = `${val.slice(0,4)} ${val.slice(4)}`;
    else if (val.length > 6 && val.length <= 8) formatted = `${val.slice(0,4)} ${val.slice(4,7)} ${val.slice(7)}`;
    else if (val.length > 8) formatted = `${val.slice(0,4)} ${val.slice(4,7)} ${val.slice(7,9)} ${val.slice(9)}`;
    
    handlePassengerChange(index, 'contactPhone', formatted);
  };

  const handleCardNumberChange = (text) => {
    let val = text.replace(/\D/g, '').slice(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setPayment({...payment, cardNumber: formatted});
  };

  const handleExpiryChange = (text) => {
    let val = text.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      let month = parseInt(val.slice(0, 2));
      if (month > 12) val = '12' + val.slice(2);
      if (month === 0) val = '01' + val.slice(2);
    }
    setPayment({...payment, expiry: val.length > 2 ? `${val.slice(0, 2)}/${val.slice(2)}` : val});
  };

  const handlePaymentSubmit = () => {
    // Validasyon
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.firstName || !p.lastName || p.identityNumber.length !== 11 || p.contactPhone.length < 14) {
        Alert.alert('Eksik Bilgi', `${i + 1}. Yolcu için bilgileri eksiksiz (11 haneli TCKN ve Telefon) giriniz.`);
        return;
      }
    }
    if (payment.cardNumber.replace(/\s/g, '').length !== 16 || payment.expiry.length !== 5 || payment.cvv.length !== 3) {
      Alert.alert('Eksik Bilgi', 'Kredi kartı bilgilerinizi tam ve eksiksiz giriniz.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      Alert.alert('Ödeme Başarılı', `${passengers.length} adet bilet başarıyla satın alındı.`, [
        { text: 'Seyahatlerime Git', onPress: () => { setLoading(false); router.replace('/mytrips'); } }
      ]);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerTitle}>Kalan Süreniz</Text>
          <Text style={[styles.timerText, timeLeft < 120 && {color: 'red'}]}>{formatTime(timeLeft)}</Text>
        </View>

        <Text style={styles.mainTitle}>1. Yolcu Bilgileri</Text>
        
        {passengers.map((p, idx) => (
          <View key={p.seatNumber} style={styles.card}>
            <View style={styles.passengerHeader}>
              <Text style={styles.passengerTitle}>Yolcu {idx + 1}</Text>
              <Text style={styles.seatBadge}>{p.seatNumber} - {p.gender === 'erkek' ? 'Erkek' : 'Kadın'}</Text>
            </View>

            <View style={styles.row}>
              <TextInput style={[styles.input, {flex: 1, marginRight: 8}]} placeholder="Ad" value={p.firstName} onChangeText={t => handlePassengerChange(idx, 'firstName', t)} />
              <TextInput style={[styles.input, {flex: 1, marginLeft: 8}]} placeholder="Soyad" value={p.lastName} onChangeText={t => handlePassengerChange(idx, 'lastName', t)} />
            </View>
            <TextInput style={styles.input} placeholder="TCKN (11 Hane)" keyboardType="numeric" maxLength={11} value={p.identityNumber} onChangeText={t => handleIdentityChange(idx, t)} />
            <TextInput style={styles.input} placeholder="İletişim Numarası (05xx xxx xx xx)" keyboardType="phone-pad" maxLength={15} value={p.contactPhone} onChangeText={t => handlePhoneChange(idx, t)} />
          </View>
        ))}

        <Text style={styles.mainTitle}>2. Ödeme Bilgileri</Text>
        <View style={styles.card}>
          <Text style={styles.infoText}>Test aşamasındadır. Rastgele kart bilgileri girebilirsiniz.</Text>
          <TextInput style={styles.input} placeholder="Kart Numarası" keyboardType="numeric" maxLength={19} value={payment.cardNumber} onChangeText={handleCardNumberChange} />
          <View style={styles.row}>
            <TextInput style={[styles.input, {flex: 1, marginRight: 8}]} placeholder="AA/YY" keyboardType="numeric" maxLength={5} value={payment.expiry} onChangeText={handleExpiryChange} />
            <TextInput style={[styles.input, {flex: 1, marginLeft: 8}]} placeholder="CVV" keyboardType="numeric" maxLength={3} value={payment.cvv} onChangeText={t => setPayment({...payment, cvv: t.replace(/\D/g, '')})} />
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Sipariş Özeti</Text>
          <View style={styles.summaryRow}><Text>Bilet Fiyatı Toplamı</Text><Text>{450 * passengers.length} ₺</Text></View>
          <View style={styles.summaryRow}><Text>Hizmet Bedeli Toplamı</Text><Text>{(450 * 0.05) * passengers.length} ₺</Text></View>
          <View style={styles.summaryRowTotal}><Text style={styles.totalText}>Ödenecek Tutar</Text><Text style={styles.totalVal}>{(450 + 22.5) * passengers.length} ₺</Text></View>
        </View>

        <TouchableOpacity style={styles.payButton} onPress={handlePaymentSubmit} disabled={loading || timeLeft === 0}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payButtonText}>Ödemeyi Tamamla</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} disabled={loading}>
          <Text style={styles.cancelButtonText}>İptal Et ve Geri Dön</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f5f9' },
  container: { padding: 20 },
  timerContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 16, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#d33b2b' },
  timerTitle: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  timerText: { fontSize: 24, fontWeight: 'bold', color: '#d33b2b' },
  
  mainTitle: { fontSize: 18, fontWeight: 'bold', color: '#0b2261', marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  
  passengerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 10, marginBottom: 15 },
  passengerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0b2261' },
  seatBadge: { backgroundColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 12, fontWeight: 'bold', color: '#374151', overflow: 'hidden' },
  
  infoText: { color: '#6b7280', fontSize: 12, marginBottom: 15 },
  input: { backgroundColor: '#f4f5f9', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16 },
  row: { flexDirection: 'row' },
  
  summaryCard: { backgroundColor: '#0b2261', padding: 20, borderRadius: 16, marginBottom: 20 },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryRowTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderTopColor: '#4b5563', paddingTop: 10 },
  totalText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  totalVal: { color: '#d33b2b', fontSize: 20, fontWeight: 'bold' },

  payButton: { backgroundColor: '#d33b2b', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  payButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cancelButton: { padding: 16, alignItems: 'center' },
  cancelButtonText: { color: '#6b7280', fontSize: 16, fontWeight: '600' }
});
