import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip2Go'ya Hoş Geldiniz</Text>
      <Text style={styles.subtitle}>Uygulama İskeleti Kuruldu</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Geliştirilen Ekranlar</Text>
        
        <TouchableOpacity style={styles.button} onPress={() => router.push('/profile')}>
          <Text style={styles.buttonText}>Profil Ekranını Görüntüle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.reservationButton]} onPress={() => router.push('/reservation')}>
          <Text style={styles.buttonText}>Koltuk Rezervasyonu & Bilet Al</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.myTripsButton]} onPress={() => router.push('/mytrips')}>
          <Text style={styles.buttonText}>Seyahatlerim</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.adminButton]} onPress={() => router.push('/admin')}>
          <Text style={styles.buttonText}>Admin Paneli (Sefer Yönetimi)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0b2261',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  reservationButton: {
    backgroundColor: '#d33b2b',
  },
  myTripsButton: {
    backgroundColor: '#f59e0b',
  },
  adminButton: {
    backgroundColor: '#374151',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
