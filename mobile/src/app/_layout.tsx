import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('trip2go_token');
      if (!token) {
        // Token yoksa login sayfasına at
        router.replace('/auth');
      } else {
        // Token varsa tabs sayfasına at
        router.replace('/(tabs)');
      }
    } catch (e) {
      router.replace('/auth');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f5f9'}}>
        <ActivityIndicator size="large" color="#0b2261" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ title: "Kimlik Doğrulama", headerShown: false }} />
      <Stack.Screen name="admin-auth" options={{ title: "Yönetici Girişi", headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ title: "Şifremi Unuttum", headerShown: false }} />
      <Stack.Screen name="reservation" options={{ title: "Sefer & Koltuk Seçimi", headerBackTitle: "Geri" }} />
      <Stack.Screen name="checkout" options={{ title: "Güvenli Ödeme", headerBackTitle: "Geri" }} />
      <Stack.Screen name="admin" options={{ title: "Admin Paneli", headerShown: false }} />
    </Stack>
  );
}
