import { router, Stack } from 'expo-router';
import { Button } from 'react-native';

export default function RootLayout() {

  return (
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="sportDetail/[sport_id]" 
          options={({ route }) => ({
            title: route.params?.name || 'Titre',
            headerLeft: () => (
              <Button title="Retour" onPress={() => {
                // Ici, tu définis l'action de retour que tu souhaites
                router.back();
              }} />
            ),
          })}
        />
      </Stack>
  );
}
