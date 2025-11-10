import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
// Version info - update as needed
const APP_VERSION = '1.0.0';

const AboutScreen = ({ navigation }) => {
  const appInfo = {
    name: 'Haron India',
    version: APP_VERSION,
    build: '1',
    description: 'Your trusted partner for agricultural products and farming solutions.',
  };

  const aboutLinks = [
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: 'description',
      onPress: () => {
        // Navigate to terms screen or open URL
        console.log('Open Terms of Service');
      },
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'privacy-tip',
      onPress: () => {
        // Navigate to privacy policy screen or open URL
        console.log('Open Privacy Policy');
      },
    },
    {
      id: 'licenses',
      title: 'Open Source Licenses',
      icon: 'code',
      onPress: () => {
        // Navigate to licenses screen
        console.log('Open Licenses');
      },
    },
  ];

  const socialLinks = [
    {
      id: 'website',
      title: 'Visit Website',
      icon: 'language',
      url: 'https://haronindia.com',
    },
    {
      id: 'facebook',
      title: 'Facebook',
      icon: 'facebook',
      url: 'https://facebook.com/haronindia',
    },
    {
      id: 'twitter',
      title: 'Twitter',
      icon: 'alternate-email',
      url: 'https://twitter.com/haronindia',
    },
    {
      id: 'instagram',
      title: 'Instagram',
      icon: 'camera-alt',
      url: 'https://instagram.com/haronindia',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.appInfoSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/app_logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>{appInfo.name}</Text>
          <Text style={styles.appDescription}>{appInfo.description}</Text>
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version {appInfo.version}</Text>
            <Text style={styles.buildText}>Build {appInfo.build}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          {aboutLinks.map((link) => (
            <TouchableOpacity key={link.id} style={styles.linkItem} onPress={link.onPress}>
              <View style={styles.linkIcon}>
                <Icon name={link.icon} size={24} color="#2E7D32" />
              </View>
              <Text style={styles.linkTitle}>{link.title}</Text>
              <Icon name="chevron-right" size={24} color="#666666" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          {socialLinks.map((link) => (
            <TouchableOpacity
              key={link.id}
              style={styles.linkItem}
              onPress={() => {
                if (link.url) {
                  Linking.openURL(link.url).catch(err =>
                    console.error('Failed to open URL:', err)
                  );
                }
              }}
            >
              <View style={styles.linkIcon}>
                <Icon name={link.icon} size={24} color="#2E7D32" />
              </View>
              <Text style={styles.linkTitle}>{link.title}</Text>
              <Icon name="chevron-right" size={24} color="#666666" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Haron India. All rights reserved.
          </Text>
          <Text style={styles.footerSubtext}>
            Made with ❤️ for farmers
          </Text>
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
  appInfoSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  versionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  versionText: {
    fontSize: 14,
    color: '#666666',
  },
  buildText: {
    fontSize: 14,
    color: '#666666',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  linkTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
});

export default AboutScreen;

