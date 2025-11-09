import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, typography, spacing } from '../constants/theme';

const PhoneVerificationScreen = ({ navigation, route }) => {
  const { step = '1 of 2', userData, isSignUp = false } = route.params || {};
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || '');
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const { saveUserData } = useUser();

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Auto OTP detection from SMS
  useEffect(() => {
    if (Platform.OS === 'android' && codeSent) {
      setAutoDetecting(true);
      
      // For Android, we can use SMS retriever API
      // This is a simplified implementation
      const checkForOTP = () => {
        // In a real app, you would use react-native-sms-retriever
        // For demo purposes, we'll simulate auto-detection
        const simulatedOTP = '1234'; // This would come from SMS
        if (simulatedOTP && otp.length === 0) {
          setOtp(simulatedOTP);
          setAutoDetecting(false);
        }
      };

      // Simulate auto-detection after 3 seconds
      const timer = setTimeout(checkForOTP, 3000);
      return () => clearTimeout(timer);
    }
  }, [codeSent]);

  const handleSendCode = () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }
    setCodeSent(true);
    setCountdown(15);
    // Simulate sending code
    Alert.alert('Code Sent', 'Verification code has been sent to your phone');
  };

  const handleVerify = () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }
    // Accept any 4-digit code for demo
    if (otp.length === 4) {
        // Save user data
        const userInfo = {
          phoneNumber: phoneNumber,
          name: isSignUp ? userData?.fullName || 'User' : 'User',
          email: isSignUp ? userData?.email : null,
          loginTime: new Date().toISOString(),
          loginMethod: 'phone'
        };
        
        saveUserData(userInfo);
        
        if (isSignUp) {
          Alert.alert('Success', 'Account created and phone verified successfully! Welcome to Farm Connect!', [
            { text: 'OK', onPress: () => navigation.navigate('MainTabs') }
          ]);
        } else {
          Alert.alert('Success', 'Phone verified successfully! Welcome to Farm Connect!', [
            { text: 'OK', onPress: () => navigation.navigate('MainTabs') }
          ]);
        }
    } else {
      Alert.alert('Error', 'Please enter a valid 4-digit OTP');
    }
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>Step {step}</Text>
            </View>
            <Text style={styles.title}>Enter your phone number for verification</Text>
            <Text style={styles.subtitle}>
              {codeSent ? 'Code has been sent on your phone number' : 'You will receive an SMS with verification code'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.phoneContainer}>
              <View style={styles.countryCode}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.code}>+91</Text>
              </View>
              <View style={styles.phoneInput}>
                <TextInput
                  style={styles.phoneNumber}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter phone number"
                  placeholderTextColor="#999999"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {phoneNumber ? (
                  <TouchableOpacity onPress={() => setPhoneNumber('')}>
                    <Text style={styles.clearIcon}>×</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {!codeSent ? (
              <TouchableOpacity style={styles.sendCodeButton} onPress={handleSendCode}>
                <Text style={styles.sendCodeButtonText}>Send Code</Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.otpContainer}>
                  <Text style={styles.otpLabel}>Verification Code</Text>
                  {autoDetecting && (
                    <Text style={styles.autoDetectText}>
                      🔍 Auto-detecting OTP from SMS...
                    </Text>
                  )}
                  <View style={styles.otpInputs}>
                    {[0, 1, 2, 3].map((index) => (
                      <View key={index} style={styles.otpCircle}>
                        <Text style={styles.otpText}>{otp[index] || ''}</Text>
                      </View>
                    ))}
                  </View>
                  <TextInput
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={4}
                    style={styles.otpInputField}
                    autoFocus={true}
                    placeholder=""
                  />
                </View>
                
                {countdown > 0 ? (
                  <Text style={styles.resendText}>
                    Resend code in {formatCountdown(countdown)}
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleSendCode}>
                    <Text style={styles.resendLink}>Resend Code</Text>
                  </TouchableOpacity>
                )}
                {countdown > 0 && (
                  <Text style={styles.countdownText}>
                    Auto verifying your OTP in ({formatCountdown(countdown)})
                  </Text>
                )}

                <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
                  <Text style={styles.verifyButtonText}>Verify</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.alternativeLogin}>
              <Text style={styles.alternativeText}>Don't have a phone? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
                <Text style={styles.alternativeLink}>Sign in with Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#F0F8E8',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stepBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 15,
  },
  stepText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: '#FFFFFF',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  flag: {
    fontSize: 20,
    marginRight: 5,
  },
  code: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneNumber: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  clearIcon: {
    fontSize: 20,
    color: '#999999',
    padding: 5,
  },
  sendCodeButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  sendCodeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  otpContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  otpLabel: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 15,
    fontWeight: '500',
  },
  otpInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  autoDetectText: {
    fontSize: 12,
    color: '#2E7D32',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  otpInputField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    fontSize: 20,
    textAlign: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 10,
  },
  resendLink: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  countdownText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  verifyButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alternativeLogin: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  alternativeText: {
    fontSize: 16,
    color: '#666666',
  },
  alternativeLink: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default PhoneVerificationScreen;
