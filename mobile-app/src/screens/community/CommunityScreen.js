import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const CommunityScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    scamType: '',
    region: '',
    pincode: '',
    isAnonymous: false,
    tags: '',
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching community posts from:', `${API_BASE_URL}/api/community/posts`);
      
      const response = await fetch(`${API_BASE_URL}/api/community/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Community posts response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Community posts data:', data);
        setPosts(data.posts || data.data || []);
      } else {
        console.log('Failed to fetch posts:', response.status);
        Toast.show({
          type: 'error',
          text1: 'Failed to load posts',
          text2: 'Please try again later',
        });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !newPost.scamType || !newPost.region || !newPost.pincode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const tags = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      console.log('Creating post with data:', { ...newPost, tags });
      
      const response = await fetch(`${API_BASE_URL}/api/community/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newPost,
          tags,
        }),
      });

      console.log('Create post response status:', response.status);

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Post created successfully!',
        });
        setShowCreateModal(false);
        setNewPost({
          title: '',
          content: '',
          scamType: '',
          region: '',
          pincode: '',
          isAnonymous: false,
          tags: '',
        });
        fetchPosts();
      } else {
        const data = await response.json();
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.message || 'Failed to create post',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Network error. Please try again.',
      });
    }
  };

  const getScamTypeColor = (type) => {
    const colors = {
      phishing: '#e74c3c',
      investment: '#f39c12',
      romance: '#e91e63',
      'tech-support': '#9b59b6',
      'fake-calls': '#34495e',
      'social-media': '#3498db',
      'upi-fraud': '#2ecc71',
      banking: '#1abc9c',
      other: '#95a5a6',
    };
    return colors[type] || '#95a5a6';
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.scamType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Text style={styles.createButton}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.postsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredPosts.map((post) => (
          <View key={post._id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <View style={[styles.scamTypeBadge, { backgroundColor: getScamTypeColor(post.scamType) }]}>
                <Text style={styles.scamTypeText}>
                  {post.scamType.replace('-', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.postContent} numberOfLines={3}>
              {post.content}
            </Text>
            
            <View style={styles.postMeta}>
              <Text style={styles.postAuthor}>
                {post.isAnonymous ? 'Anonymous' : post.author?.name || 'Unknown'}
              </Text>
              <Text style={styles.postDate}>
                {new Date(post.createdAt).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.postFooter}>
              <Text style={styles.postLocation}>{post.region}, {post.pincode}</Text>
              <View style={styles.postStats}>
                <Text style={styles.postViews}>{post.views} views</Text>
                <Text style={styles.postVotes}>
                  {post.votes?.upvotes || 0} ↑ {post.votes?.downvotes || 0} ↓
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Create Post Modal */}
      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Post</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalCloseButton}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={newPost.title}
                onChangeText={(value) => setNewPost(prev => ({ ...prev, title: value }))}
                placeholder="Enter post title"
              />

              <Text style={styles.label}>Content *</Text>
              <TextInput
                style={styles.textArea}
                value={newPost.content}
                onChangeText={(value) => setNewPost(prev => ({ ...prev, content: value }))}
                placeholder="Share your experience..."
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Scam Type *</Text>
              <View style={styles.scamTypeContainer}>
                {['phishing', 'investment', 'romance', 'tech-support', 'fake-calls', 'social-media', 'upi-fraud', 'banking', 'other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.scamTypeOption,
                      newPost.scamType === type && styles.scamTypeOptionActive
                    ]}
                    onPress={() => setNewPost(prev => ({ ...prev, scamType: type }))}
                  >
                    <Text style={[
                      styles.scamTypeOptionText,
                      newPost.scamType === type && styles.scamTypeOptionTextActive
                    ]}>
                      {type.replace('-', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Region *</Text>
              <View style={styles.regionContainer}>
                {['North', 'South', 'East', 'West', 'Central', 'Northeast'].map((region) => (
                  <TouchableOpacity
                    key={region}
                    style={[
                      styles.regionOption,
                      newPost.region === region && styles.regionOptionActive
                    ]}
                    onPress={() => setNewPost(prev => ({ ...prev, region }))}
                  >
                    <Text style={[
                      styles.regionOptionText,
                      newPost.region === region && styles.regionOptionTextActive
                    ]}>
                      {region}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Pincode *</Text>
              <TextInput
                style={styles.input}
                value={newPost.pincode}
                onChangeText={(value) => setNewPost(prev => ({ ...prev, pincode: value }))}
                placeholder="Enter pincode (6 digits)"
                keyboardType="numeric"
                maxLength={6}
              />

              <Text style={styles.label}>Tags (optional)</Text>
              <TextInput
                style={styles.input}
                value={newPost.tags}
                onChangeText={(value) => setNewPost(prev => ({ ...prev, tags: value }))}
                placeholder="Enter tags separated by commas"
              />

              <TouchableOpacity
                style={styles.anonymousContainer}
                onPress={() => setNewPost(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
              >
                <View style={[styles.checkbox, newPost.isAnonymous && styles.checkboxChecked]}>
                  {newPost.isAnonymous && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Post anonymously</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreatePost}
              >
                <Text style={styles.createButtonText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  createButton: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  postsContainer: {
    flex: 1,
    padding: 15,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 10,
  },
  scamTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scamTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  postAuthor: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  postDate: {
    fontSize: 12,
    color: '#999',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postLocation: {
    fontSize: 12,
    color: '#666',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postViews: {
    fontSize: 12,
    color: '#999',
    marginRight: 10,
  },
  postVotes: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#999',
  },
  modalBody: {
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
  scamTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  scamTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  scamTypeOptionActive: {
    backgroundColor: '#9b59b6',
    borderColor: '#9b59b6',
  },
  scamTypeOptionText: {
    fontSize: 12,
    color: '#666',
  },
  scamTypeOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  regionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  regionOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  regionOptionActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  regionOptionText: {
    fontSize: 12,
    color: '#666',
  },
  regionOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  anonymousContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
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
    color: '#2c3e50',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
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
  createButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommunityScreen;
