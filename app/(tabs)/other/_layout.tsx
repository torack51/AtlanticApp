import { Stack } from 'expo-router';

export default function RootLayout() {

  return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, title:"Autre"}} />
        <Stack.Screen name="announcements" options={{ headerTitle:"Annonces", title:"Annnonces"}}/>
        <Stack.Screen name="legalNotices" options={{ headerTitle:"Mentions Légales", title:"Mentions légales"}}/>
      </Stack>
  );
}
