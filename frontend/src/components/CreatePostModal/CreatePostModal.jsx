import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    scamType: '',
    region: '',
    pincode: '',
    isAnonymous: false,
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const scamTypes = [
    { value: 'phishing', label: 'Phishing' },
    { value: 'investment', label: 'Investment Scams' },
    { value: 'romance', label: 'Romance Scams' },
    { value: 'tech-support', label: 'Tech Support Scams' },
    { value: 'fake-calls', label: 'Fake Calls' },
    { value: 'social-media', label: 'Social Media Scams' },
    { value: 'other', label: 'Other' }
  ];

  const regions = [
    { value: 'North', label: 'North India' },
    { value: 'South', label: 'South India' },
    { value: 'East', label: 'East India' },
    { value: 'West', label: 'West India' },
    { value: 'Central', label: 'Central India' },
    { value: 'Northeast', label: 'Northeast India' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length > 2000) {
      newErrors.content = 'Content must be less than 2000 characters';
    }
    
    if (!formData.scamType) {
      newErrors.scamType = 'Please select a scam type';
    }
    
    if (!formData.region) {
      newErrors.region = 'Please select a region';
    }
    
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const payload = {
        ...formData,
        tags
      };
      
      const response = await fetch('http://localhost:5000/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }
      
      const data = await response.json();
      if (data.success) {
        toast.success('Post created successfully!');
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a descriptive title for your post"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={200}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.title.length}/200 characters
              </p>
            </div>
            
            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                placeholder="Share your scam experience, provide details about what happened, and any advice for others..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={2000}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.content.length}/2000 characters
              </p>
            </div>
            
            {/* Scam Type */}
            <div>
              <label htmlFor="scamType" className="block text-sm font-medium text-gray-700 mb-2">
                Scam Type *
              </label>
              <select
                id="scamType"
                name="scamType"
                value={formData.scamType}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.scamType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select scam type</option>
                {scamTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.scamType && (
                <p className="text-red-500 text-sm mt-1">{errors.scamType}</p>
              )}
            </div>
            
            {/* Region */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                Region *
              </label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.region ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select region</option>
                {regions.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
              {errors.region && (
                <p className="text-red-500 text-sm mt-1">{errors.region}</p>
              )}
            </div>
            
            {/* Pincode */}
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                Pincode *
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter your pincode (6 digits)"
                maxLength="6"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pincode ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.pincode && (
                <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
              )}
            </div>
            
            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (optional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Enter tags separated by commas (e.g., urgent, phone-call, bank)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 text-sm mt-1">
                Separate multiple tags with commas
              </p>
            </div>
            
            {/* Anonymous Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAnonymous"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-700">
                Post anonymously
              </label>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
