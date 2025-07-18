import React, { useState } from 'react';
import {

View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
Alert,
SafeAreaView,
KeyboardAvoidingView,
Platform,
} from 'react-native';

const ResetPasswordScreen = () => {
const [email, setEmail] = useState('');
const [loading, setLoading] = useState(false);

const handleResetPassword = () => {
    if (!email) {
        Alert.alert('Error', 'Please enter your email address.');
        return;
    }
    setLoading(true);
    // TODO: Implement password reset logic (e.g., call Firebase or your API)
    console.log('Attempting to reset password for:', email);

    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        Alert.alert(
            'Check your email',
            'If an account with that email exists, we have sent a password reset link.',
        );
        // navigation.goBack(); // Optional: navigate back after submission
    }, 2000);
};

return (
    <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
        >
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                    Enter the email address associated with your account, and we'll send you a link to reset your password.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    placeholderTextColor="#888"
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
},
keyboardAvoidingView: {
    flex: 1,
},
innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
},
title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
},
subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
},
input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
},
button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
},
buttonDisabled: {
    backgroundColor: '#a0cfff',
},
buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
},
});

export default ResetPasswordScreen;