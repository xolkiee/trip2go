import {  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform, Modal, FlatList  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function SearchScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vehicleType, setVehicleType] = useState('bus');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [allTrips, setAllTrips] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Modals state
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationSelectionType, setLocationSelectionType] = useState('origin'); // 'origin' | 'destination'
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [upcomingDates, setUpcomingDates] = useState([]);

  useFocusEffect(
    useCallback(() => {
      checkLogin();
    }, [])
  );

  useEffect(() => {
    fetchTrips();
    fetchLocations();
    generateDates();
  }, []);

  const checkLogin = async () => {
    const token = await AsyncStorage.getItem('trip2go_token');
    setIsLoggedIn(!!token);
  };

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips/search');
      if (response.data.success) {
        setAllTrips(response.data.data);
        setResults(response.data.data.filter(t => t.type === vehicleType));
      }
    } catch (error) {
      console.log('Error fetching trips', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations');
      if (response.data.success) {
        // Alfabetik olarak A'dan Z'ye sıralayalım
        const sorted = response.data.data.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        setLocations(sorted);
        setFilteredLocations(sorted);
      }
    } catch (error) {
      console.log('Error fetching locations', error);
    }
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
    setSelectedDate(dates[0].toISOString().split('T')[0]); // Default to today
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      await AsyncStorage.removeItem('trip2go_token');
      await AsyncStorage.removeItem('trip2go_user');
      setIsLoggedIn(false);
    };

    if (Platform.OS === 'web') {
      doLogout();
    } else {
      Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istediğinize emin misiniz?', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: doLogout }
      ]);
    }
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const openLocationModal = (type) => {
    setLocationSelectionType(type);
    setLocationSearchQuery('');
    
    const filtered = locations.filter(loc => {
      if (vehicleType === 'bus' && loc.type !== 'city') return false;
      if (vehicleType === 'flight' && loc.type !== 'airport') return false;
      return true;
    });
    
    setFilteredLocations(filtered);
    setLocationModalVisible(true);
  };

  const filterLocations = (text) => {
    setLocationSearchQuery(text);
    const lowerText = text.toLocaleLowerCase('tr-TR');
    
    let baseFilter = locations.filter(loc => {
      if (vehicleType === 'bus' && loc.type !== 'city') return false;
      if (vehicleType === 'flight' && loc.type !== 'airport') return false;
      return true;
    });

    if (text) {
      baseFilter = baseFilter.filter(loc => 
        (loc.name && loc.name.toLocaleLowerCase('tr-TR').includes(lowerText))
      );
    }
    setFilteredLocations(baseFilter);
  };

  const selectLocation = (loc) => {
    if (locationSelectionType === 'origin') {
      setOrigin(loc.name);
    } else {
      setDestination(loc.name);
    }
    setLocationModalVisible(false);
  };

  const handleSearch = () => {
    setSearching(true);
    setTimeout(() => {
      let filtered = allTrips.filter(t => t.type === vehicleType);
      
      if (origin) {
        const oLower = origin.toLocaleLowerCase('tr-TR');
        filtered = filtered.filter(t => {
          const tOrigin = t.origin.toLocaleLowerCase('tr-TR');
          return tOrigin.includes(oLower) || oLower.includes(tOrigin);
        });
      }
      
      if (destination) {
        const dLower = destination.toLocaleLowerCase('tr-TR');
        filtered = filtered.filter(t => {
          const tDest = t.destination.toLocaleLowerCase('tr-TR');
          return tDest.includes(dLower) || dLower.includes(tDest);
        });
      }
      
      if (selectedDate) {
        // Tarihi yerel saat diliminde kontrol edelim (ISO string UTC olduğu için kayma yapabiliyor)
        const selected = new Date(selectedDate).toLocaleDateString('tr-TR');
        filtered = filtered.filter(t => {
          const tripDate = new Date(t.departureTime).toLocaleDateString('tr-TR');
          return tripDate === selected;
        });
      }
      
      setResults(filtered);
      setSearching(false);
    }, 800);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nereye Gidiyoruz?</Text>
        {isLoggedIn ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Çıkış ⍈</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={styles.loginBtnText}>Giriş Yap</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchCard}>
        <View style={styles.typeToggle}>
          <TouchableOpacity style={[styles.typeButton, vehicleType === 'bus' && styles.typeActive]} onPress={() => {setVehicleType('bus'); setOrigin(''); setDestination('');}}>
            <Text style={[styles.typeText, vehicleType === 'bus' && styles.typeActiveText]}>🚌 Otobüs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeButton, vehicleType === 'flight' && styles.typeActive]} onPress={() => {setVehicleType('flight'); setOrigin(''); setDestination('');}}>
            <Text style={[styles.typeText, vehicleType === 'flight' && styles.typeActiveText]}>✈️ Uçak</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.searchInputBtn} onPress={() => openLocationModal('origin')}>
            <Text style={origin ? styles.inputText : styles.placeholderText}>{origin ? origin : 'Nereden (Örn: İstanbul)'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.switchIcon} onPress={handleSwap}>
            <Text style={{fontSize: 18, color: '#0b2261', textAlign: 'center'}}>⇅</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.searchInputBtn} onPress={() => openLocationModal('destination')}>
            <Text style={destination ? styles.inputText : styles.placeholderText}>{destination ? destination : 'Nereye (Örn: Ankara)'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.searchInputBtn} onPress={() => setDateModalVisible(true)}>
            <Text style={selectedDate ? styles.inputText : styles.placeholderText}>📅 {formatDateLabel(selectedDate)}</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Seferleri Bul</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {(searching || initialLoading) && <ActivityIndicator size="large" color="#d33b2b" style={{marginTop: 50}} />}
        
        {results && results.length === 0 && !initialLoading && (
          <Text style={styles.noResultsText}>Aradığınız kriterlere uygun sefer bulunamadı.</Text>
        )}

        {results && !initialLoading && !searching && (
          <FlatList
            data={results}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.resultsContainer}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            renderItem={({ item: trip }) => {
              const time = new Date(trip.departureTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              const arrival = new Date(trip.arrivalTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              return (
                <TouchableOpacity style={styles.tripCard} onPress={() => router.push(`/reservation?tripId=${trip._id}`)}>
                  <View style={styles.tripTop}>
                    <Text style={styles.tripCompany}>{trip.company}</Text>
                    <Text style={styles.tripPrice}>{trip.price} ₺</Text>
                  </View>
                  <View style={styles.tripMiddle}>
                    <View style={styles.routeCol}>
                      <Text style={styles.time}>{time}</Text>
                      <Text style={styles.city}>{trip.origin}</Text>
                    </View>
                    <Text style={styles.routeArrow}>➔</Text>
                    <View style={styles.routeCol}>
                      <Text style={styles.time}>{arrival}</Text>
                      <Text style={styles.city}>{trip.destination}</Text>
                    </View>
                  </View>
                  <View style={styles.tripBottom}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text style={styles.seatInfo}>Son {trip.availableSeats} Koltuk</Text>
                      <Text style={{color: '#6b7280', fontSize: 13, marginLeft: 10}}>• {trip.type === 'flight' ? 'Flight Standart' : `${trip.seatLayout || '2+2'} Standart`}</Text>
                    </View>
                    <Text style={styles.buyText}>Seç ve İlerle ➔</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* LOCATION PICKER MODAL */}
      <Modal visible={locationModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setLocationModalVisible(false)}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{locationSelectionType === 'origin' ? 'Kalkış Noktası Seçin' : 'Varış Noktası Seçin'}</Text>
            <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
              <Text style={styles.modalCloseText}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalSearchContainer}>
            <TextInput 
              style={styles.modalSearchInput} 
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
            ListEmptyComponent={<Text style={styles.emptyText}>Sonuç bulunamadı.</Text>}
          />
        </SafeAreaView>
      </Modal>

      {/* DATE PICKER MODAL */}
      <Modal visible={dateModalVisible} animationType="slide" transparent={true} onRequestClose={() => setDateModalVisible(false)}>
        <View style={styles.bottomModalOverlay}>
          <View style={styles.bottomModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tarih Seçin</Text>
              <TouchableOpacity onPress={() => setDateModalVisible(false)}>
                <Text style={styles.modalCloseText}>Kapat</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={upcomingDates}
              keyExtractor={(item) => item.toISOString()}
              renderItem={({ item }) => {
                const isoStr = item.toISOString().split('T')[0];
                const isSelected = selectedDate === isoStr;
                return (
                  <TouchableOpacity 
                    style={[styles.dateItem, isSelected && styles.dateItemSelected]} 
                    onPress={() => { setSelectedDate(isoStr); setDateModalVisible(false); }}
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
  header: { backgroundColor: '#0b2261', padding: 20, paddingTop: 40, paddingBottom: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  logoutBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  loginBtn: { backgroundColor: '#d33b2b', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  searchCard: { backgroundColor: '#fff', margin: 20, marginTop: -40, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  typeToggle: { flexDirection: 'row', backgroundColor: '#f4f5f9', borderRadius: 12, padding: 5, marginBottom: 20 },
  typeButton: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 10 },
  typeActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
  typeText: { fontSize: 15, color: '#6b7280', fontWeight: '600' },
  typeActiveText: { color: '#0b2261', fontWeight: 'bold' },

  inputContainer: { position: 'relative', marginBottom: 15 },
  searchInputBtn: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 15, marginBottom: 10, justifyContent: 'center' },
  inputText: { fontSize: 16, color: '#111827', fontWeight: '600' },
  placeholderText: { fontSize: 16, color: '#9ca3af' },
  switchIcon: { position: 'absolute', right: 20, top: 22, backgroundColor: '#fff', padding: 10, borderRadius: 25, borderWidth: 1, borderColor: '#e5e7eb', zIndex: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },

  searchButton: { backgroundColor: '#d33b2b', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 5 },
  searchButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  resultsContainer: { paddingHorizontal: 20 },
  noResultsText: { textAlign: 'center', color: '#6b7280', marginTop: 30 },
  
  tripCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#e5e7eb' },
  tripTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  tripCompany: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  tripPrice: { fontSize: 18, fontWeight: 'bold', color: '#d33b2b' },
  
  tripMiddle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  routeCol: { flex: 1 },
  time: { fontSize: 20, fontWeight: 'bold', color: '#0b2261' },
  city: { fontSize: 14, color: '#6b7280' },
  routeArrow: { fontSize: 20, color: '#d1d5db', paddingHorizontal: 20 },

  tripBottom: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  seatInfo: { color: '#f59e0b', fontWeight: '600' },
  buyText: { color: '#d33b2b', fontWeight: 'bold' },

  modalSafeArea: { flex: 1, backgroundColor: '#f4f5f9' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  modalCloseText: { fontSize: 16, color: '#d33b2b', fontWeight: '600' },
  modalSearchContainer: { padding: 15, backgroundColor: '#fff' },
  modalSearchInput: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, fontSize: 16 },
  locationItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
  locationCity: { fontSize: 16, fontWeight: '600', color: '#111827' },
  locationName: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#6b7280' },

  bottomModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomModalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' },
  dateItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  dateItemSelected: { backgroundColor: '#eef2ff' },
  dateItemText: { fontSize: 16, color: '#374151', textAlign: 'center' },
  dateItemTextSelected: { color: '#0b2261', fontWeight: 'bold' }
});

