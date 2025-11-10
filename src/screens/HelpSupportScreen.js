import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HelpSupportScreen = ({ navigation }) => {
  const handleContact = (type, value) => {
    if (type === 'email') {
      Linking.openURL(`mailto:${value}`);
    } else if (type === 'phone') {
      Linking.openURL(`tel:${value}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeSubtitle}>
            Contact us for any questions or support
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.helpItem} 
          onPress={() => handleContact('email', 'support@haronindia.com')}
        >
          <View style={styles.helpIcon}>
            <Icon name="email" size={24} color="#2E7D32" />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Email Support</Text>
            <Text style={styles.helpSubtitle}>support@haronindia.com</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#666666" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.helpItem} 
          onPress={() => handleContact('phone', '+911800XXXXXXX')}
        >
          <View style={styles.helpIcon}>
            <Icon name="phone" size={24} color="#2E7D32" />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Call Us</Text>
            <Text style={styles.helpSubtitle}>+91 1800-XXX-XXXX</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#666666" />
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Icon name="info" size={20} color="#2E7D32" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Support Hours</Text>
            <Text style={styles.infoText}>
              Monday - Friday: 9:00 AM - 6:00 PM{'\n'}
              Saturday: 10:00 AM - 4:00 PM{'\n'}
              Sunday: Closed
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  placeholder: {
    width: 24,
  },
  content: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  helpSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1B5E20',
    lineHeight: 20,
  },
});

export default HelpSupportScreen;
