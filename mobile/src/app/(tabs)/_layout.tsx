import { Tabs } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

export default function TabLayout() {
  const [isAdmin, setIsAdmin] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const checkRole = async () => {
        const userStr = await AsyncStorage.getItem('trip2go_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setIsAdmin(user.role === 'admin');
        } else {
          setIsAdmin(false);
        }
      };
      checkRole();
    }, [])
  );

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#d33b2b',
      tabBarInactiveTintColor: '#6b7280',
      headerShown: false,
      tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 5 }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Arama',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="mytrips"
        options={{
          title: 'Seyahatlerim',
          href: isAdmin ? null : '/mytrips',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎟️</Text>,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Sefer Yönetimi',
          href: isAdmin ? '/admin' : null,
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
