import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function OnboardingLayout() {
    return (
        <View style={{ flex: 1 }}>
            <Stack
                initialRouteName="index"
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
            </Stack>
        </View>
    );
}