import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import api from '../services/api';

export default function SearchScreen() {
  const [vehicleType, setVehicleType] = useState('bus');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [allTrips, setAllTrips] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips');
      setAllTrips(response.data.data);
      setResults(response.data.data.filter(t => t.type === vehicleType));
    } catch (error) {
      console.log('Error fetching trips', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSearch = () => {
    setSearching(true);
    setTimeout(() => {
      let filtered = allTrips.filter(t => t.type === vehicleType);
      if (origin) {
        filtered = filtered.filter(t => t.origin.toLowerCase().includes(origin.toLowerCase()));
      }
      if (destination) {
        filtered = filtered.filter(t => t.destination.toLowerCase().includes(destination.toLowerCase()));
      }
      setResults(filtered);
      setSearching(false);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nereye Gidiyoruz?</Text>
      </View>

      <View style={styles.searchCard}>
        <View style={styles.typeToggle}>
          <TouchableOpacity style={[styles.typeButton, vehicleType === 'bus' && styles.typeActive]} onPress={() => setVehicleType('bus')}>
            <Text style={[styles.typeText, vehicleType === 'bus' && styles.typeActiveText]}>🚌 Otobüs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeButton, vehicleType === 'flight' && styles.typeActive]} onPress={() => setVehicleType('flight')}>
            <Text style={[styles.typeText, vehicleType === 'flight' && styles.typeActiveText]}>✈️ Uçak</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput style={styles.searchInput} placeholder="Nereden (Örn: İstanbul)" value={origin} onChangeText={setOrigin} />
          <View style={styles.switchIcon}><Text>⇅</Text></View>
          <TextInput style={styles.searchInput} placeholder="Nereye (Örn: Ankara)" value={destination} onChangeText={setDestination} />
        </View>
        
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Seferleri Bul</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {(searching || initialLoading) && <ActivityIndicator size="large" color="#d33b2b" style={{marginTop: 50}} />}
        
        {results && results.length === 0 && !initialLoading && (
          <Text style={styles.noResultsText}>Aradığınız kriterlere uygun sefer bulunamadı.</Text>
        )}

        {results && results.map((trip) => {
          // Gelen data formatı: { company, price, origin, destination, departureTime, arrivalTime, availableSeats, ... }
          const time = new Date(trip.departureTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
          const arrival = new Date(trip.arrivalTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
          return (
            <TouchableOpacity key={trip._id} style={styles.tripCard} onPress={() => router.push(`/reservation?tripId=${trip._id}`)}>
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
                <Text style={styles.seatInfo}>Son {trip.availableSeats} Koltuk</Text>
                <Text style={styles.buyText}>Seç ve İlerle ➔</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f5f9' },
  header: { backgroundColor: '#0b2261', padding: 20, paddingTop: 40, paddingBottom: 60 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  
  searchCard: { backgroundColor: '#fff', margin: 20, marginTop: -40, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  typeToggle: { flexDirection: 'row', backgroundColor: '#f4f5f9', borderRadius: 12, padding: 5, marginBottom: 20 },
  typeButton: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 10 },
  typeActive: { backgroundColor: '#fff', shadowOpacity: 0.1, elevation: 2 },
  typeText: { fontSize: 15, color: '#6b7280', fontWeight: '600' },
  typeActiveText: { color: '#0b2261', fontWeight: 'bold' },

  inputContainer: { position: 'relative', marginBottom: 20 },
  searchInput: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 15, fontSize: 16, marginBottom: 10 },
  switchIcon: { position: 'absolute', right: 20, top: 40, backgroundColor: '#fff', padding: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', zIndex: 10 },

  searchButton: { backgroundColor: '#d33b2b', padding: 16, borderRadius: 12, alignItems: 'center' },
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
  buyText: { color: '#d33b2b', fontWeight: 'bold' }
});
