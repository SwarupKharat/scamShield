import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../stores/authStore';
import Toast from 'react-native-toast-message';

const IncidentFormScreen = ({ navigation }) => {
  const { reportIncident, isReportingIncident } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    pincode: '',
    severity: 'low',
    image: null,
    includeScammerDetails: false,
    scammerName: '',
    scammerPhone: '',
    scammerUpiId: '',
    scammerEmail: '',
    scammerWebsite: '',
    scammerType: '',
    scammerDescription: '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, image: result.assets[0] }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.image) newErrors.image = 'Please upload an image';
    
    if (formData.includeScammerDetails) {
      if (!formData.scammerName.trim()) newErrors.scammerName = 'Scammer name is required';
      if (!formData.scammerPhone.trim()) newErrors.scammerPhone = 'Scammer phone number is required';
      if (!formData.scammerType) newErrors.scammerType = 'Scam type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('pincode', formData.pincode);
    formDataToSend.append('severity', formData.severity);
    
    if (formData.image) {
      formDataToSend.append('image', {
        uri: formData.image.uri,
        type: 'image/jpeg',
        name: 'incident.jpg',
      });
    }

    if (formData.includeScammerDetails) {
      const scammerDetails = {
        name: formData.scammerName,
        phoneNumber: formData.scammerPhone,
        upiId: formData.scammerUpiId,
        email: formData.scammerEmail,
        website: formData.scammerWebsite,
        scamType: formData.scammerType,
        description: formData.scammerDescription,
      };
      formDataToSend.append('scammerDetails', JSON.stringify(scammerDetails));
    }

    const result = await reportIncident(formDataToSend);
    
    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: result.message,
      });
      navigation.goBack();
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: result.message,
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Report Incident</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="Enter incident title"
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Describe the incident in detail"
            multiline
            numberOfLines={4}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={[styles.input, errors.location && styles.inputError]}
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
            placeholder="Enter incident location"
          />
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

          <Text style={styles.label}>Pincode *</Text>
          <TextInput
            style={[styles.input, errors.pincode && styles.inputError]}
            value={formData.pincode}
            onChangeText={(value) => handleInputChange('pincode', value)}
            placeholder="Enter pincode (6 digits)"
            keyboardType="numeric"
            maxLength={6}
          />
          {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}

          <Text style={styles.label}>Severity</Text>
          <View style={styles.severityContainer}>
            {['low', 'medium', 'high', 'critical'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.severityButton,
                  formData.severity === level && styles.severityButtonActive
                ]}
                onPress={() => handleInputChange('severity', level)}
              >
                <Text style={[
                  styles.severityText,
                  formData.severity === level && styles.severityTextActive
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Upload Image *</Text>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            {formData.image ? (
              <Image source={{ uri: formData.image.uri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Tap to select image</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}

          {/* Scammer Details Section */}
          <View style={styles.scammerSection}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => handleInputChange('includeScammerDetails', !formData.includeScammerDetails)}
            >
              <View style={[styles.checkbox, formData.includeScammerDetails && styles.checkboxChecked]}>
                {formData.includeScammerDetails && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Include Scammer Details (Optional)</Text>
            </TouchableOpacity>

            {formData.includeScammerDetails && (
              <View style={styles.scammerForm}>
                <Text style={styles.label}>Scammer Name *</Text>
                <TextInput
                  style={[styles.input, errors.scammerName && styles.inputError]}
                  value={formData.scammerName}
                  onChangeText={(value) => handleInputChange('scammerName', value)}
                  placeholder="Enter scammer's name"
                />
                {errors.scammerName && <Text style={styles.errorText}>{errors.scammerName}</Text>}

                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={[styles.input, errors.scammerPhone && styles.inputError]}
                  value={formData.scammerPhone}
                  onChangeText={(value) => handleInputChange('scammerPhone', value)}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
                {errors.scammerPhone && <Text style={styles.errorText}>{errors.scammerPhone}</Text>}

                <Text style={styles.label}>UPI ID</Text>
                <TextInput
                  style={styles.input}
                  value={formData.scammerUpiId}
                  onChangeText={(value) => handleInputChange('scammerUpiId', value)}
                  placeholder="Enter UPI ID (if known)"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.scammerEmail}
                  onChangeText={(value) => handleInputChange('scammerEmail', value)}
                  placeholder="Enter email (if known)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Website</Text>
                <TextInput
                  style={styles.input}
                  value={formData.scammerWebsite}
                  onChangeText={(value) => handleInputChange('scammerWebsite', value)}
                  placeholder="Enter website (if known)"
                  keyboardType="url"
                  autoCapitalize="none"
                />

                <Text style={styles.label}>Scam Type *</Text>
                <View style={styles.scamTypeContainer}>
                  {['phishing', 'investment', 'romance', 'tech-support', 'fake-calls', 'social-media', 'upi-fraud', 'banking', 'other'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.scamTypeButton,
                        formData.scammerType === type && styles.scamTypeButtonActive
                      ]}
                      onPress={() => handleInputChange('scammerType', type)}
                    >
                      <Text style={[
                        styles.scamTypeText,
                        formData.scammerType === type && styles.scamTypeTextActive
                      ]}>
                        {type.replace('-', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.scammerType && <Text style={styles.errorText}>{errors.scammerType}</Text>}

                <Text style={styles.label}>Additional Details</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.scammerDescription}
                  onChangeText={(value) => handleInputChange('scammerDescription', value)}
                  placeholder="Provide additional details about the scammer"
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isReportingIncident && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isReportingIncident}
          >
            <Text style={styles.submitButtonText}>
              {isReportingIncident ? 'Submitting...' : 'Submit Incident'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
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
  form: {
    padding: 20,
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
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
  severityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  severityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  severityButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  severityText: {
    fontSize: 14,
    color: '#666',
  },
  severityTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  imageButton: {
    marginBottom: 10,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  imagePlaceholderText: {
    color: '#666',
    fontSize: 16,
  },
  scammerSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  scammerForm: {
    marginTop: 15,
  },
  scamTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  scamTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  scamTypeButtonActive: {
    backgroundColor: '#9b59b6',
    borderColor: '#9b59b6',
  },
  scamTypeText: {
    fontSize: 12,
    color: '#666',
  },
  scamTypeTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IncidentFormScreen;
