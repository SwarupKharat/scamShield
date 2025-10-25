import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Shield, Info, AlertCircle, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const Announcements = () => {
    const { authUser, authRole } = useAuthStore();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: '',
        content: '',
        type: 'info',
        priority: 'medium'
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/admin/announcements', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setAnnouncements(data.announcements || []);
            } else {
                // Mock data for demonstration
                setAnnouncements([
                    {
                        _id: '1',
                        title: 'New Phishing Campaign Alert',
                        content: 'A new phishing campaign targeting banking customers has been detected. Be cautious of suspicious emails asking for personal information.',
                        type: 'warning',
                        priority: 'high',
                        createdAt: '2024-10-22T10:30:00Z',
                        author: 'Admin'
                    },
                    {
                        _id: '2',
                        title: 'Government Initiative: Digital Security Awareness',
                        content: 'The government has launched a new digital security awareness program. Visit the official website for more information and resources.',
                        type: 'info',
                        priority: 'medium',
                        createdAt: '2024-10-21T14:15:00Z',
                        author: 'Admin'
                    },
                    {
                        _id: '3',
                        title: 'UPI Fraud Prevention Tips',
                        content: 'Recent increase in UPI fraud cases. Always verify the recipient details before making any UPI transactions.',
                        type: 'alert',
                        priority: 'high',
                        createdAt: '2024-10-20T09:45:00Z',
                        author: 'Admin'
                    }
                ]);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAnnouncement = async (e) => {
        e.preventDefault();
        if (!newAnnouncement.title || !newAnnouncement.content) return;

        try {
            const response = await fetch('http://localhost:5000/api/admin/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newAnnouncement)
            });

            if (response.ok) {
                const data = await response.json();
                setAnnouncements([data.announcement, ...announcements]);
                setNewAnnouncement({ title: '', content: '', type: 'info', priority: 'medium' });
                setShowAddForm(false);
            }
        } catch (error) {
            console.error('Error adding announcement:', error);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-5 h-5" />;
            case 'alert': return <AlertCircle className="w-5 h-5" />;
            case 'info': return <Info className="w-5 h-5" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'alert': return 'bg-red-100 text-red-800 border-red-200';
            case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-l-red-500';
            case 'medium': return 'border-l-yellow-500';
            case 'low': return 'border-l-green-500';
            default: return 'border-l-gray-500';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                        <Bell className="w-6 h-6 mr-2 text-blue-600" />
                        Cyber Alerts & Announcements
                    </h2>
                    <p className="text-gray-600">Stay updated with the latest security alerts and government initiatives</p>
                </div>

                {authRole === 'admin' && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <Bell className="w-4 h-4 mr-2" />
                        Add Alert
                    </button>
                )}
            </div>

            {/* Add Announcement Form */}
            {showAddForm && authRole === 'admin' && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Add New Announcement</h3>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleAddAnnouncement} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={newAnnouncement.title}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter announcement title"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <textarea
                                value={newAnnouncement.content}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter announcement content"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={newAnnouncement.type}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="info">Information</option>
                                    <option value="warning">Warning</option>
                                    <option value="alert">Alert</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    value={newAnnouncement.priority}
                                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Announcement
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Announcements List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : announcements.length === 0 ? (
                <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No announcements yet</p>
                    <p className="text-gray-400">Check back later for updates</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <div
                            key={announcement._id}
                            className={`border-l-4 ${getPriorityColor(announcement.priority)} bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className={`p-2 rounded-lg border ${getTypeColor(announcement.type)}`}>
                                            {getTypeIcon(announcement.type)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>By {announcement.author}</span>
                                                <span>•</span>
                                                <span>{formatDate(announcement.createdAt)}</span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${announcement.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                        announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                    }`}>
                                                    {announcement.priority.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Announcements;
