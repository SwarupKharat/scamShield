import React, { useState } from 'react';
import ScamMap from '../../components/ScamMap/ScamMap';
import { Map, AlertTriangle, MessageCircle, TrendingUp } from 'lucide-react';

const MapPage = () => {
  const [activeTab, setActiveTab] = useState('combined');

  const tabs = [
    { id: 'combined', label: 'Combined View', icon: Map },
    { id: 'incidents', label: 'Incidents Only', icon: AlertTriangle },
    { id: 'community', label: 'Community Posts', icon: MessageCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scam Hotspots Map</h1>
          <p className="text-gray-600">
            Interactive map showing scam incidents and community reports across India
          </p>
        </div>

        {/* Map Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <ScamMap mapType={activeTab} />
          </div>
        </div>

        {/* Map Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Incident Reports</h3>
            </div>
            <p className="text-gray-600 text-sm">
              View reported scam incidents with severity levels and location details. 
              Red markers indicate critical incidents, while green markers show low-severity cases.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Community Posts</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Explore community discussions and experiences shared by users. 
              Blue markers represent community posts about scam experiences.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Scam Hotspots</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Identify areas with high scam activity. Larger circles indicate 
              more reports in that pincode area, helping you stay alert.
            </p>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Stay Safe Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Before Making Payments:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Verify the person's identity through official channels</li>
                <li>Never share OTP or banking details over phone</li>
                <li>Check if the organization is legitimate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">If You Suspect a Scam:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Report immediately to local authorities</li>
                <li>Block the scammer's contact details</li>
                <li>Share your experience to help others</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
