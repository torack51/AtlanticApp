import { Stack } from 'expo-router';

export default function MatchesLayout() {
  return (
    <Stack screenOptions={{ headerShown : false}}>
      <Stack.Screen name="[id]" /> {/* Pour les routes comme /matches/123 */}
    </Stack>
  );
}