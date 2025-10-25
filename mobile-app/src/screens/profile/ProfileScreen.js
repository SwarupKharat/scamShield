import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../stores/authStore';
import Toast from 'react-native-toast-message';

const ProfileScreen = ({ navigation }) => {
  const { authUser, updateProfile, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: authUser?.firstName || '',
    lastName: authUser?.lastName || '',
    email: authUser?.email || '',
    mobile: authUser?.mobile || '',
    address: authUser?.address || '',
    aadharCard: authUser?.aadharCard || '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
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
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Handle image upload here
      Toast.show({
        type: 'success',
        text1: 'Image Selected',
        text2: 'Profile picture updated successfully',
      });
    }
  };

  const handleSave = async () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email || !profileData.mobile) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    const result = await updateProfile(profileData);
    
    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: result.message,
      });
      setIsEditing(false);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: result.message,
      });
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setProfileData({
      firstName: authUser?.firstName || '',
      lastName: authUser?.lastName || '',
      email: authUser?.email || '',
      mobile: authUser?.mobile || '',
      address: authUser?.address || '',
      aadharCard: authUser?.aadharCard || '',
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={styles.editButton}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: authUser?.profilePic || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          {isEditing && (
            <TouchableOpacity style={styles.editAvatarButton} onPress={pickImage}>
              <Text style={styles.editAvatarText}>📷</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.userName}>
          {authUser?.name || 'User Name'}
        </Text>
        <Text style={styles.userRole}>
          {authUser?.role?.toUpperCase() || 'USER'}
        </Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.inputRow}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={profileData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              editable={isEditing}
              placeholder="First name"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={profileData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              editable={isEditing}
              placeholder="Last name"
            />
          </View>
        </View>

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={[styles.input, !isEditing && styles.inputDisabled]}
          value={profileData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          editable={isEditing}
          placeholder="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mobile Number *</Text>
        <TextInput
          style={[styles.input, !isEditing && styles.inputDisabled]}
          value={profileData.mobile}
          onChangeText={(value) => handleInputChange('mobile', value)}
          editable={isEditing}
          placeholder="Mobile number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.textArea, !isEditing && styles.inputDisabled]}
          value={profileData.address}
          onChangeText={(value) => handleInputChange('address', value)}
          editable={isEditing}
          placeholder="Address"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Aadhar Card Number</Text>
        <TextInput
          style={[styles.input, !isEditing && styles.inputDisabled]}
          value={profileData.aadharCard}
          onChangeText={(value) => handleInputChange('aadharCard', value)}
          editable={isEditing}
          placeholder="Aadhar card number"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Reports Made</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Posts Created</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Help Provided</Text>
          </View>
        </View>
      </View>

      {isEditing && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.dangerSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    fontSize: 18,
    color: '#3498db',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  editButton: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3498db',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3498db',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarText: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: '#7f8c8d',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
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
  inputDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#666',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    height: 80,
    textAlignVertical: 'top',
  },
  statsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#27ae60',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerSection: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
