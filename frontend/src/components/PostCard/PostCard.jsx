import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post, onDelete, onVoteUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);

  const handleVote = async (voteType) => {
    setVoteLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${post._id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ voteType })
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      const data = await response.json();
      if (data.success) {
        onVoteUpdate(post._id, data.data.upvotes, data.data.downvotes);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote on post');
    } finally {
      setVoteLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${post._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Comment added successfully!');
        setNewComment('');
        // Refresh the post to get updated comments
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${post._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      const data = await response.json();
      if (data.success) {
        onDelete(post._id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleReport = async () => {
    const reason = prompt('Please provide a reason for reporting this post:');
    if (!reason) return;

    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${post._id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Failed to report post');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Post reported successfully');
      }
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Failed to report post');
    }
  };

  const getScamTypeColor = (scamType) => {
    const colors = {
      phishing: 'bg-red-100 text-red-800',
      investment: 'bg-yellow-100 text-yellow-800',
      romance: 'bg-pink-100 text-pink-800',
      'tech-support': 'bg-blue-100 text-blue-800',
      'fake-calls': 'bg-purple-100 text-purple-800',
      'social-media': 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[scamType] || colors.other;
  };

  const formatScamType = (scamType) => {
    return scamType.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Post Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {post.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>
                By {post.isAnonymous ? 'Anonymous' : post.author?.name || 'Unknown'}
              </span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              <span>•</span>
              <span>{post.region}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScamTypeColor(post.scamType)}`}>
              {formatScamType(post.scamType)}
            </span>
            {post.isPinned && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                Pinned
              </span>
            )}
          </div>
        </div>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="p-6">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Post Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Voting */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVote('upvote')}
                disabled={voteLoading}
                className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span>{post.votes.upvotes}</span>
              </button>
              
              <button
                onClick={() => handleVote('downvote')}
                disabled={voteLoading}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>{post.votes.downvotes}</span>
              </button>
            </div>

            {/* Comments */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments.length}</span>
            </button>

            {/* Views */}
            <div className="flex items-center space-x-1 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{post.views}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReport}
              className="text-gray-500 hover:text-red-600 transition-colors text-sm"
            >
              Report
            </button>
            {(post.author?._id === localStorage.getItem('userId') || localStorage.getItem('userRole') === 'admin') && (
              <button
                onClick={handleDelete}
                className="text-gray-500 hover:text-red-600 transition-colors text-sm"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200">
          {/* Add Comment Form */}
          <div className="p-4 bg-gray-50">
            <form onSubmit={handleAddComment} className="flex space-x-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Comment'}
              </button>
            </form>
          </div>

          {/* Comments List */}
          <div className="p-4 space-y-4">
            {post.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              post.comments.map((comment, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {comment.isAnonymous ? 'A' : (comment.author?.name?.[0] || 'U')}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.isAnonymous ? 'Anonymous' : comment.author?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
