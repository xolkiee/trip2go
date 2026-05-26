import { Stack } from "expo-router";
import "../global.css";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Trip2Go" }} />
      <Stack.Screen name="profile" options={{ title: "Profilim", headerBackTitle: "Geri" }} />
      <Stack.Screen name="reservation" options={{ title: "Sefer & Koltuk Seçimi", headerBackTitle: "Geri" }} />
      <Stack.Screen name="checkout" options={{ title: "Güvenli Ödeme", headerBackTitle: "Geri" }} />
      <Stack.Screen name="mytrips" options={{ title: "Seyahatlerim", headerBackTitle: "Geri" }} />
      <Stack.Screen name="admin" options={{ title: "Admin Paneli", headerBackTitle: "Geri" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
