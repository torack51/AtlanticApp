import { Stack } from 'expo-router';

export default function RootLayout() {

  return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sportDetail/[sport_id]" options={({route}) => ({title : route.params?.name || 'Titre'})}/>
      </Stack>
  );
}
