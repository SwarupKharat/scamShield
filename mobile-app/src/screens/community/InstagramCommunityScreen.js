import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { API_BASE_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const InstagramCommunityScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching Instagram-style posts from:', `${API_BASE_URL}/api/community/posts`);
      
      const response = await fetch(`${API_BASE_URL}/api/community/posts?limit=20&sortBy=createdAt&sortOrder=desc`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Posts response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Posts data received:', data);
        setPosts(data.data?.posts || []);
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Network error. Please try again.',
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

  const handleLike = async (postId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const isLiked = likedPosts.has(postId);
      
      const response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          voteType: isLiked ? 'downvote' : 'upvote'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { ...post, votes: data.data }
              : post
          )
        );

        // Update liked posts
        if (isLiked) {
          setLikedPosts(prev => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
          });
        } else {
          setLikedPosts(prev => new Set([...prev, postId]));
        }

        Toast.show({
          type: 'success',
          text1: isLiked ? 'Unliked' : 'Liked',
          text2: isLiked ? 'Post unliked' : 'Post liked',
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to like post',
      });
    }
  };

  const handleComment = async (postId) => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: commentText,
          isAnonymous: false
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { ...post, comments: [...post.comments, data.data] }
              : post
          )
        );

        setCommentText('');
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Comment added successfully',
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add comment',
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

  const formatTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    return postDate.toLocaleDateString();
  };

  const renderPost = (post, index) => (
    <View key={post._id} style={styles.postContainer}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: getScamTypeColor(post.scamType) }]}>
            <Text style={styles.avatarText}>
              {post.isAnonymous ? 'A' : (post.author?.name?.charAt(0) || 'U')}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>
              {post.isAnonymous ? 'Anonymous User' : (post.author?.name || 'Unknown User')}
            </Text>
            <Text style={styles.timestamp}>{formatTimeAgo(post.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="more-vert" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postText}>{post.content}</Text>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, tagIndex) => (
              <View key={tagIndex} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Scam Type Badge */}
        <View style={[styles.scamTypeBadge, { backgroundColor: getScamTypeColor(post.scamType) }]}>
          <Text style={styles.scamTypeText}>{post.scamType.toUpperCase()}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.postActions}>
        <View style={styles.leftActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(post._id)}
          >
            <Icon 
              name={likedPosts.has(post._id) ? "favorite" : "favorite-border"} 
              size={24} 
              color={likedPosts.has(post._id) ? "#e74c3c" : "#666"} 
            />
            <Text style={styles.actionText}>{post.votes?.upvotes || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowComments(showComments === post._id ? null : post._id)}
          >
            <Icon name="chat-bubble-outline" size={24} color="#666" />
            <Text style={styles.actionText}>{post.comments?.length || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="share" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="bookmark-border" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Comments Section */}
      {showComments === post._id && (
        <View style={styles.commentsSection}>
          {/* Existing Comments */}
          {post.comments && post.comments.slice(0, 3).map((comment, commentIndex) => (
            <View key={commentIndex} style={styles.comment}>
              <Text style={styles.commentText}>
                <Text style={styles.commentAuthor}>
                  {comment.isAnonymous ? 'Anonymous' : (comment.author?.name || 'Unknown')}:
                </Text>
                {' '}{comment.content}
              </Text>
            </View>
          ))}
          
          {/* Add Comment */}
          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity 
              style={styles.postCommentButton}
              onPress={() => handleComment(post._id)}
            >
              <Text style={styles.postCommentText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Posts Feed */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.feed}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.map((post, index) => renderPost(post, index))}
        
        {posts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon name="post-add" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share a scam experience</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Post Modal */}
      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Post title"
                value={newPost.title}
                onChangeText={(text) => setNewPost({...newPost, title: text})}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share your scam experience..."
                value={newPost.content}
                onChangeText={(text) => setNewPost({...newPost, content: text})}
                multiline
                numberOfLines={4}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Scam type (e.g., phishing, investment)"
                value={newPost.scamType}
                onChangeText={(text) => setNewPost({...newPost, scamType: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Region"
                value={newPost.region}
                onChangeText={(text) => setNewPost({...newPost, region: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Pincode"
                value={newPost.pincode}
                onChangeText={(text) => setNewPost({...newPost, pincode: text})}
                keyboardType="numeric"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Tags (comma separated)"
                value={newPost.tags}
                onChangeText={(text) => setNewPost({...newPost, tags: text})}
              />
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.postButton}
                onPress={handleCreatePost}
              >
                <Text style={styles.postButtonText}>Post</Text>
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  createButton: {
    backgroundColor: '#e74c3c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feed: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: '#fff',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  postText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  scamTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scamTypeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#f8f8f8',
  },
  comment: {
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  commentAuthor: {
    fontWeight: '600',
    color: '#000',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  postCommentButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postCommentText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalBody: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666',
  },
  postButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
  },
  postButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

export default InstagramCommunityScreen;
