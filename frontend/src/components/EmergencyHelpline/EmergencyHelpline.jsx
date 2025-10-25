import React, { useState } from 'react';
import { Phone, MessageCircle, AlertTriangle, Shield, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EmergencyHelpline = () => {
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 mb-8 border-l-4 border-red-500">
            <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                <h2 className="text-2xl font-bold text-red-800">🆘 Emergency Scam Helpline</h2>
            </div>

            <p className="text-gray-700 mb-6">
                Get immediate assistance for scam-related emergencies. Our helpline is available 24/7.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Form */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                        Quick Contact
                    </h3>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mobile Number
                            </label>
                            <input
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="+91-XXXXXXXXXX"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleQuickAction('emergency')}
                                disabled={loading || !mobile}
                                className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
                            >
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                Emergency
                            </button>

                            <button
                                onClick={() => handleQuickAction('tips')}
                                disabled={loading || !mobile}
                                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
                            >
                                <Shield className="w-4 h-4 mr-1" />
                                Safety Tips
                            </button>
                        </div>
                    </div>
                </div>

                {/* Emergency Contacts */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Phone className="w-5 h-5 mr-2 text-green-600" />
                        Emergency Contacts
                    </h3>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center">
                                <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                                <div>
                                    <div className="font-medium text-red-900">Cyber Crime</div>
                                    <div className="text-sm text-red-700">National Helpline</div>
                                </div>
                            </div>
                            <div className="font-mono text-red-900 font-bold">1930</div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center">
                                <Phone className="w-4 h-4 text-blue-600 mr-2" />
                                <div>
                                    <div className="font-medium text-blue-900">Police</div>
                                    <div className="text-sm text-blue-700">Emergency</div>
                                </div>
                            </div>
                            <div className="font-mono text-blue-900 font-bold">100</div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center">
                                <MessageCircle className="w-4 h-4 text-green-600 mr-2" />
                                <div>
                                    <div className="font-medium text-green-900">WhatsApp</div>
                                    <div className="text-sm text-green-700">Chat Support</div>
                                </div>
                            </div>
                            <div className="font-mono text-green-900 font-bold">+91-XXXX-XXXXXX</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center">
                    <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800 font-medium">
                        Available 24/7 • Response time: Under 5 minutes
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EmergencyHelpline;
