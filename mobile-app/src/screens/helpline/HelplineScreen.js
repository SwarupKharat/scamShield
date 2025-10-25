import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const HelplineScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [recipientMobile, setRecipientMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const helplineNumbers = {
    sms: '+91-XXXX-XXXXXX',
    whatsapp: '+91-XXXX-XXXXXX',
    phone: '+91-XXXX-XXXXXX',
  };

  const quickActions = [
    {
      title: 'Welcome Message',
      description: 'Send helpline introduction',
      action: () => sendQuickMessage('Welcome to Prabhodhanyaya Scam Helpline! We are here to help you with scam verification, emergency assistance, and reporting guidance.'),
    },
    {
      title: 'Safety Tips',
      description: 'Send prevention tips',
      action: () => sendQuickMessage('Safety Tips: 1) Never share personal information 2) Verify before transferring money 3) Report suspicious calls immediately 4) Keep your bank details confidential.'),
    },
    {
      title: 'Scam Verification',
      description: 'Check if something is a scam',
      action: () => sendQuickMessage('To verify if something is a scam, please provide details about the suspicious activity. We will help you identify if it is legitimate or fraudulent.'),
    },
    {
      title: 'Emergency Alert',
      description: 'Send emergency notification',
      action: () => sendQuickMessage('EMERGENCY ALERT: If you are in immediate danger or have been scammed, please contact local police immediately and call our emergency helpline.'),
    },
  ];

  const sendQuickMessage = (messageText) => {
    setMessage(messageText);
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (!recipientMobile.trim()) {
      Alert.alert('Error', 'Please enter recipient mobile number');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Sending helpline message to:', `${API_BASE_URL}/api/helpline/send-message`);
      
      const response = await fetch(`${API_BASE_URL}/api/helpline/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          recipientMobile,
        }),
      });

      console.log('Helpline message response status:', response.status);

      const data = await response.json();
      if (response.ok && data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: data.message,
        });
        setMessage('');
        setRecipientMobile('');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.message || 'Failed to send message',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (number) => {
    const url = `whatsapp://send?phone=${number.replace(/[^0-9]/g, '')}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed on this device');
    });
  };

  const makePhoneCall = (number) => {
    const url = `tel:${number}`;
    Linking.openURL(url);
  };

  const sendSMS = (number) => {
    const url = `sms:${number}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Helpline</Text>
      </View>

      <View style={styles.content}>
        {/* Contact Numbers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Numbers</Text>
          <View style={styles.contactCards}>
            <View style={styles.contactCard}>
              <Text style={styles.contactTitle}>📞 Phone</Text>
              <Text style={styles.contactNumber}>{helplineNumbers.phone}</Text>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => makePhoneCall(helplineNumbers.phone)}
              >
                <Text style={styles.contactButtonText}>Call Now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contactCard}>
              <Text style={styles.contactTitle}>💬 WhatsApp</Text>
              <Text style={styles.contactNumber}>{helplineNumbers.whatsapp}</Text>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: '#25D366' }]}
                onPress={() => openWhatsApp(helplineNumbers.whatsapp)}
              >
                <Text style={styles.contactButtonText}>Open WhatsApp</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contactCard}>
              <Text style={styles.contactTitle}>📱 SMS</Text>
              <Text style={styles.contactNumber}>{helplineNumbers.sms}</Text>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: '#FF6B6B' }]}
                onPress={() => sendSMS(helplineNumbers.sms)}
              >
                <Text style={styles.contactButtonText}>Send SMS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionCard}
                onPress={action.action}
              >
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Send Custom Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send Custom Message</Text>
          <View style={styles.messageForm}>
            <Text style={styles.label}>Recipient Mobile Number</Text>
            <TextInput
              style={styles.input}
              value={recipientMobile}
              onChangeText={setRecipientMobile}
              placeholder="Enter mobile number (e.g., +919876543210)"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Your Message</Text>
            <TextInput
              style={styles.textArea}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message here..."
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[styles.sendButton, loading && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={loading}
            >
              <Text style={styles.sendButtonText}>
                {loading ? 'Sending...' : 'Send Message'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Information</Text>
          <View style={styles.emergencyInfo}>
            <Text style={styles.emergencyText}>
              🚨 In case of immediate danger or if you have been scammed:
            </Text>
            <Text style={styles.emergencyStep}>1. Contact local police immediately</Text>
            <Text style={styles.emergencyStep}>2. Call our emergency helpline</Text>
            <Text style={styles.emergencyStep}>3. Preserve all evidence</Text>
            <Text style={styles.emergencyStep}>4. Inform your bank if money is involved</Text>
          </View>
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          <View style={styles.safetyTips}>
            <Text style={styles.safetyTip}>✅ Never share personal information over phone</Text>
            <Text style={styles.safetyTip}>✅ Verify before transferring money</Text>
            <Text style={styles.safetyTip}>✅ Report suspicious calls immediately</Text>
            <Text style={styles.safetyTip}>✅ Keep your bank details confidential</Text>
            <Text style={styles.safetyTip}>✅ Be cautious of unsolicited offers</Text>
            <Text style={styles.safetyTip}>✅ Verify the identity of callers</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    fontSize: 18,
    color: '#3498db',
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  contactCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contactCard: {
    width: '30%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  contactNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#666',
  },
  messageForm: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    height: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyInfo: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 10,
  },
  emergencyStep: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
  },
  safetyTips: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  safetyTip: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
  },
});

export default HelplineScreen;
