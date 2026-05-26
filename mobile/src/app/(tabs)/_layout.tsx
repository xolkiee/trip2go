import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

export default function TabLayout() {
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
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎟️</Text>,
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
