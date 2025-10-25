import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { API_BASE_URL } from '../../config/api';
import { testConnection, getNetworkErrorMessage } from '../../utils/network';
import { quickNetworkTest } from '../../utils/quickTest';

const NetworkDebugScreen = ({ navigation }) => {
  const [testResults, setTestResults] = useState('');
  const [customIP, setCustomIP] = useState('192.168.1.7');
  const [isTesting, setIsTesting] = useState(false);

  const runNetworkTest = async () => {
    setIsTesting(true);
    setTestResults('Running quick network test...\n');
    
    // Quick test all possible URLs
    const result = await quickNetworkTest();
    if (result.success) {
      setTestResults(prev => prev + `✅ WORKING URL FOUND: ${result.url}\n\nUpdate your API_BASE_URL to this URL!\n`);
    } else {
      setTestResults(prev => prev + `❌ No working URLs found. Check if backend server is running.\n`);
    }
    
    setTestResults(prev => prev + '\nRunning detailed tests...\n');
    
     try {
       // Test 1: Basic connectivity (test root endpoint)
       setTestResults(prev => prev + '1. Testing basic connectivity...\n');
       const basicTest = await fetch(`${API_BASE_URL}/`, {
         method: 'GET',
         timeout: 5000,
       });
       
       if (basicTest.ok) {
         setTestResults(prev => prev + `✅ Basic connectivity: SUCCESS\nServer is responding\n`);
       } else {
         setTestResults(prev => prev + `❌ Basic connectivity: FAILED (${basicTest.status})\n`);
       }
     } catch (error) {
       setTestResults(prev => prev + `❌ Basic connectivity: FAILED - ${error.message}\n`);
     }

    // Test 2: Login endpoint
    try {
      setTestResults(prev => prev + '2. Testing login endpoint...\n');
      const loginTest = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
      });
      
      if (loginTest.status === 400 || loginTest.status === 401) {
        setTestResults(prev => prev + '✅ Login endpoint: ACCESSIBLE (expected auth error)\n');
      } else {
        setTestResults(prev => prev + `❌ Login endpoint: UNEXPECTED (${loginTest.status})\n`);
      }
    } catch (error) {
      setTestResults(prev => prev + `❌ Login endpoint: FAILED - ${error.message}\n`);
    }

    // Test 3: Community endpoint
    try {
      setTestResults(prev => prev + '3. Testing community endpoint...\n');
      const communityTest = await fetch(`${API_BASE_URL}/api/community/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (communityTest.status === 200 || communityTest.status === 401) {
        setTestResults(prev => prev + '✅ Community endpoint: ACCESSIBLE\n');
      } else {
        setTestResults(prev => prev + `❌ Community endpoint: FAILED (${communityTest.status})\n`);
      }
    } catch (error) {
      setTestResults(prev => prev + `❌ Community endpoint: FAILED - ${error.message}\n`);
    }

    setTestResults(prev => prev + '\nNetwork test completed!\n');
    setIsTesting(false);
  };

  const testCustomIP = async () => {
    if (!customIP.trim()) {
      Alert.alert('Error', 'Please enter a valid IP address');
      return;
    }

    setIsTesting(true);
    setTestResults(`Testing custom IP: ${customIP}\n`);
    
    try {
       const testURL = `http://${customIP}:5000/`;
      const response = await fetch(testURL, {
        method: 'GET',
        timeout: 5000,
      });
      
      if (response.ok) {
        setTestResults(prev => prev + `✅ Custom IP test: SUCCESS\nYou can use: http://${customIP}:5000\n`);
      } else {
        setTestResults(prev => prev + `❌ Custom IP test: FAILED (${response.status})\n`);
      }
    } catch (error) {
      setTestResults(prev => prev + `❌ Custom IP test: FAILED - ${error.message}\n`);
    }
    
    setIsTesting(false);
  };

  const showNetworkInfo = () => {
    Alert.alert(
      'Network Configuration Help',
      `Current API URL: ${API_BASE_URL}\n\nTo fix network issues:\n\n1. Make sure your backend server is running on port 5000\n2. Find your computer's IP address:\n   - Windows: ipconfig\n   - Mac/Linux: ifconfig\n3. Update the API_BASE_URL in src/config/api.js\n4. Ensure your phone and computer are on the same network\n5. Try different IP addresses if needed`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Network Debug</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Configuration</Text>
          <Text style={styles.configText}>API URL: {API_BASE_URL}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network Tests</Text>
          <TouchableOpacity
            style={[styles.testButton, isTesting && styles.testButtonDisabled]}
            onPress={runNetworkTest}
            disabled={isTesting}
          >
            <Text style={styles.testButtonText}>
              {isTesting ? 'Testing...' : 'Run Network Tests'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Custom IP</Text>
          <TextInput
            style={styles.input}
            value={customIP}
            onChangeText={setCustomIP}
            placeholder="Enter IP address (e.g., 192.168.1.7)"
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={[styles.testButton, isTesting && styles.testButtonDisabled]}
            onPress={testCustomIP}
            disabled={isTesting}
          >
            <Text style={styles.testButtonText}>Test Custom IP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>{testResults || 'No tests run yet'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.helpButton} onPress={showNetworkInfo}>
            <Text style={styles.helpButtonText}>Show Network Help</Text>
          </TouchableOpacity>
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
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  configText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 15,
  },
  resultsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  resultsText: {
    fontSize: 14,
    color: '#2c3e50',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  helpButton: {
    backgroundColor: '#f39c12',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  helpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NetworkDebugScreen;
