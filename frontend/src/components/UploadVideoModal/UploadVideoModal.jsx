import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../stores/axios';

const UploadVideoModal = ({ onClose, onVideoUploaded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scamType: '',
    region: '',
    pincode: '',
    isAnonymous: false,
    tags: ''
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const scamTypes = [
    { value: 'phishing', label: 'Phishing' },
    { value: 'investment', label: 'Investment Scams' },
    { value: 'romance', label: 'Romance Scams' },
    { value: 'tech-support', label: 'Tech Support Scams' },
    { value: 'fake-calls', label: 'Fake Calls' },
    { value: 'social-media', label: 'Social Media Scams' },
    { value: 'upi-fraud', label: 'UPI Fraud' },
    { value: 'banking', label: 'Banking Scams' },
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

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm', 'video/x-matroska'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload a video file.');
        return;
      }

      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size exceeds 500MB limit.');
        return;
      }

      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!formData.title || !formData.description || !formData.scamType || 
        !formData.region || !formData.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.pincode.length !== 6) {
      toast.error('Pincode must be 6 digits');
      return;
    }

    try {
      setUploading(true);
      
      const submitData = new FormData();
      submitData.append('video', videoFile);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('scamType', formData.scamType);
      submitData.append('region', formData.region);
      submitData.append('pincode', formData.pincode);
      submitData.append('isAnonymous', formData.isAnonymous);
      submitData.append('tags', formData.tags);

      // Use XMLHttpRequest for upload progress
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              toast.success('Video uploaded successfully!');
              onVideoUploaded();
            } else {
              toast.error(response.message || 'Upload failed');
            }
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            toast.error('Upload failed - invalid response');
          }
        } else if (xhr.status === 401) {
          toast.error('Authentication failed. Please login again.');
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            toast.error(errorData.message || 'Upload failed');
          } catch {
            toast.error('Upload failed');
          }
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        toast.error('Network error. Please try again.');
        setUploading(false);
      });

      xhr.open('POST', 'http://localhost:5000/api/videos/upload');
      
      // Get cookies to send with request (for authentication)
      xhr.withCredentials = true;
      
      xhr.send(submitData);

    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Upload Video</h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File *
            </label>
            <div 
              onClick={() => !uploading && fileInputRef.current.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              {videoPreview ? (
                <div>
                  <video 
                    src={videoPreview} 
                    controls 
                    className="max-h-48 mx-auto rounded-lg mb-2"
                  />
                  <p className="text-sm text-gray-600">{videoFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(videoFile.size)}</p>
                </div>
              ) : (
                <div>
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    MP4, AVI, MOV, WebM, MKV (Max 500MB)
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter video title"
                disabled={uploading}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={2000}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the video content"
                disabled={uploading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scam Type *
              </label>
              <select
                name="scamType"
                value={formData.scamType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={uploading}
                required
              >
                <option value="">Select scam type</option>
                {scamTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region *
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={uploading}
                required
              >
                <option value="">Select region</option>
                {regions.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode *
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                pattern="[0-9]{6}"
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 6-digit pincode"
                disabled={uploading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., awareness, warning"
                disabled={uploading}
              />
            </div>

            <div className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={uploading}
              />
              <label className="ml-2 text-sm text-gray-700">
                Post anonymously
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !videoFile}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadVideoModal;
