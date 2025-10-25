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
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const API_BASE_URL = 'http://192.168.1.6:5000';

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
        
        // Handle nested data structure
        let postsArray = [];
        if (data.data && data.data.posts) {
          postsArray = data.data.posts;
        } else if (data.posts) {
          postsArray = data.posts;
        } else if (Array.isArray(data.data)) {
          postsArray = data.data;
        } else if (Array.isArray(data)) {
          postsArray = data;
        }
        
        console.log('Extracted posts array:', postsArray.length, 'posts');
        setPosts(Array.isArray(postsArray) ? postsArray : []);
      } else {
        console.log('Failed to fetch posts:', response.status);
        setPosts([]); // Set empty array on error
        Toast.show({
          type: 'error',
          text1: 'Failed to load posts',
          text2: 'Please try again later',
        });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]); // Set empty array on error
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Could not connect to server',
      });
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

    if (newPost.pincode.length !== 6) {
      Alert.alert('Error', 'Pincode must be 6 digits');
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
          title: newPost.title,
          content: newPost.content,
          scamType: newPost.scamType,
          region: newPost.region,
          pincode: newPost.pincode,
          isAnonymous: newPost.isAnonymous,
          tags: tags,
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
      console.error('Error creating post:', error);
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

  // Safe filtering with array check
  const filteredPosts = Array.isArray(posts) 
    ? posts.filter(post =>
        (post.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (post.content?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (post.scamType?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      )
    : [];

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
          <Text style={styles.createButtonHeader}>+ Create</Text>
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
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts found</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share your experience!
            </Text>
          </View>
        ) : (
          filteredPosts.map((post) => (
            <View key={post._id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <View style={[styles.scamTypeBadge, { backgroundColor: getScamTypeColor(post.scamType) }]}>
                  <Text style={styles.scamTypeText}>
                    {(post.scamType || '').replace('-', ' ').toUpperCase()}
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
                  <Text style={styles.postViews}>{post.views || 0} views</Text>
                  <Text style={styles.postVotes}>
                    {post.votes?.upvotes || 0} ↑ {post.votes?.downvotes || 0} ↓
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Post Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
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
                maxLength={200}
              />

              <Text style={styles.label}>Content *</Text>
              <TextInput
                style={styles.textArea}
                value={newPost.content}
                onChangeText={(value) => setNewPost(prev => ({ ...prev, content: value }))}
                placeholder="Share your experience..."
                multiline
                numberOfLines={4}
                maxLength={2000}
              />

              <Text style={styles.label}>Scam Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
              </ScrollView>

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
                placeholder="Enter 6-digit pincode"
                keyboardType="numeric"
                maxLength={6}
              />

              <Text style={styles.label}>Tags (optional)</Text>
              <TextInput
                style={styles.input}
                value={newPost.tags}
                onChangeText={(value) => setNewPost(prev => ({ ...prev, tags: value }))}
                placeholder="awareness, warning, etc."
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
                style={styles.submitButton}
                onPress={handleCreatePost}
              >
                <Text style={styles.submitButtonText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#f8f9fa',
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
    paddingTop: 50,
  },
  backButton: {
    fontSize: 18,
    color: '#3498db',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  createButtonHeader: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
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
    fontSize: 10,
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
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
    fontSize: 28,
    color: '#999',
    fontWeight: '300',
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 12,
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
    marginVertical: 8,
  },
  scamTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    backgroundColor: 'white',
  },
  scamTypeOptionActive: {
    backgroundColor: '#9b59b6',
    borderColor: '#9b59b6',
  },
  scamTypeOptionText: {
    fontSize: 11,
    color: '#666',
  },
  scamTypeOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  regionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  regionOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    marginBottom: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
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
    fontSize: 14,
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
    padding: 14,
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
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommunityScreen;
