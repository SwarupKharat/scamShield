import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Send, AlertTriangle, Shield, Users, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Helpline = () => {
  const [message, setMessage] = useState('');
  const [mobile, setMobile] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [templates, setTemplates] = useState({});

  useEffect(() => {
    fetchHelplineStats();
    fetchTemplates();
  }, []);

  const fetchHelplineStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/helpline/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching helpline stats:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/helpline/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!mobile || !message) {
      toast.error('Please enter mobile number and message');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/helpline/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          mobile,
          message,
          messageType
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Message sent successfully!');
        setMessage('');
        setMobile('');
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    if (!mobile) {
      toast.error('Please enter mobile number first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/helpline/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          mobile,
          messageType: action
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`${action} message sent successfully!`);
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending quick action:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyScam = async () => {
    if (!mobile || !message) {
      toast.error('Please enter mobile number and scam details');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/helpline/verify-scam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userMobile: mobile,
          reportData: {
            title: 'Scam Verification Request',
            description: message
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Scam verification completed!');
        setMessage('');
      } else {
        toast.error(data.message || 'Failed to verify scam');
      }
    } catch (error) {
      console.error('Error verifying scam:', error);
      toast.error('Failed to verify scam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🆘 Scam Helpline</h1>
          <p className="text-gray-600">
            Emergency assistance and scam verification via SMS & WhatsApp
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Helpline Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                Send Helpline Message
              </h2>
              
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91-XXXXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Type
                  </label>
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General Message</option>
                    <option value="welcome">Welcome Message</option>
                    <option value="verify">Scam Verification</option>
                    <option value="tips">Safety Tips</option>
                    <option value="emergency">Emergency Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Enter your message here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleQuickAction('welcome')}
                  disabled={loading || !mobile}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">Welcome Message</h3>
                      <p className="text-sm text-gray-600">Send helpline introduction</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickAction('tips')}
                  disabled={loading || !mobile}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">Safety Tips</h3>
                      <p className="text-sm text-gray-600">Send prevention tips</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleVerifyScam}
                  disabled={loading || !mobile || !message}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">Verify Scam</h3>
                      <p className="text-sm text-gray-600">Check if something is a scam</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleQuickAction('emergency')}
                  disabled={loading || !mobile}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Phone className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">Emergency Alert</h3>
                      <p className="text-sm text-gray-600">Send emergency notification</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Helpline Numbers */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-blue-600" />
                Helpline Numbers
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-900">SMS Helpline</div>
                    <div className="text-sm text-blue-700">Send HELP to</div>
                  </div>
                  <div className="font-mono text-blue-900">
                    {stats?.helplineNumbers?.sms || '+91-XXXX-XXXXXX'}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-900">WhatsApp</div>
                    <div className="text-sm text-green-700">Chat with us</div>
                  </div>
                  <div className="font-mono text-green-900">
                    {stats?.helplineNumbers?.whatsapp || '+91-XXXX-XXXXXX'}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Phone</div>
                    <div className="text-sm text-gray-700">Call directly</div>
                  </div>
                  <div className="font-mono text-gray-900">
                    {stats?.helplineNumbers?.phone || '+91-XXXX-XXXXXX'}
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            {stats && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Helpline Statistics
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Users</span>
                    <span className="font-semibold text-gray-900">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Incidents</span>
                    <span className="font-semibold text-gray-900">{stats.totalIncidents}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Incidents */}
            {stats?.recentIncidents && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-600" />
                  Recent Incidents
                </h3>
                
                <div className="space-y-3">
                  {stats.recentIncidents.slice(0, 5).map((incident, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900 text-sm">{incident.title}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {incident.location} • {incident.severity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contacts */}
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4">🚨 Emergency Contacts</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-700">Police</span>
                  <span className="font-mono text-red-900">100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Medical</span>
                  <span className="font-mono text-red-900">108</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Fire</span>
                  <span className="font-mono text-red-900">101</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Cyber Crime</span>
                  <span className="font-mono text-red-900">1930</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Helpline;
