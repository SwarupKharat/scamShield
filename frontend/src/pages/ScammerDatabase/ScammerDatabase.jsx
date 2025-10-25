import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Search, Filter, Shield, AlertTriangle, CheckCircle, XCircle, Eye, Phone, Mail, Globe, CreditCard } from 'lucide-react';

const ScammerDatabase = () => {
  const [scammers, setScammers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    verificationStatus: '',
    scamType: '',
    riskLevel: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalScammers: 0
  });
  const [selectedScammer, setSelectedScammer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchScammers();
  }, [searchQuery, filters, pagination.currentPage]);

  const fetchScammers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 20,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.verificationStatus && { verificationStatus: filters.verificationStatus }),
        ...(filters.scamType && { scamType: filters.scamType }),
        ...(filters.riskLevel && { riskLevel: filters.riskLevel })
      });

      const response = await fetch(`http://localhost:5000/api/scammers?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setScammers(data.data.scammers);
        setPagination(data.data.pagination);
      } else {
        toast.error('Failed to fetch scammers');
      }
    } catch (error) {
      console.error('Error fetching scammers:', error);
      toast.error('Failed to fetch scammers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const getVerificationBadge = (status) => {
    const badges = {
      verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      'under-review': { color: 'bg-blue-100 text-blue-800', icon: Eye }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  const getRiskBadge = (level) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level] || colors.medium}`}>
        {level.toUpperCase()}
      </span>
    );
  };

  const openScammerDetails = (scammer) => {
    setSelectedScammer(scammer);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scammer Database</h1>
          <p className="text-gray-600">
            View and search through verified scammer information to stay protected.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, phone, UPI ID, email..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.verificationStatus}
                onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="under-review">Under Review</option>
              </select>

              <select
                value={filters.scamType}
                onChange={(e) => handleFilterChange('scamType', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="phishing">Phishing</option>
                <option value="investment">Investment</option>
                <option value="romance">Romance</option>
                <option value="tech-support">Tech Support</option>
                <option value="fake-calls">Fake Calls</option>
                <option value="social-media">Social Media</option>
                <option value="upi-fraud">UPI Fraud</option>
                <option value="banking">Banking</option>
                <option value="other">Other</option>
              </select>

              <select
                value={filters.riskLevel}
                onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Risk Levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scammers List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {scammers.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scammers found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scammer Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scam Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reports
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {scammers.map((scammer) => (
                    <tr key={scammer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{scammer.name}</div>
                          <div className="text-sm text-gray-500">{scammer.description}</div>
                          {scammer.aliases && scammer.aliases.length > 0 && (
                            <div className="text-xs text-gray-400">
                              Also known as: {scammer.aliases.join(', ')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {scammer.phoneNumber && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {scammer.phoneNumber}
                            </div>
                          )}
                          {scammer.email && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {scammer.email}
                            </div>
                          )}
                          {scammer.upiId && (
                            <div className="flex items-center text-sm text-gray-900">
                              <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                              {scammer.upiId}
                            </div>
                          )}
                          {scammer.website && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Globe className="w-4 h-4 mr-2 text-gray-400" />
                              {scammer.website}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm text-gray-900 capitalize">
                            {scammer.scamType.replace('-', ' ')}
                          </span>
                          {getRiskBadge(scammer.riskLevel)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getVerificationBadge(scammer.verificationStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{scammer.reportCount}</div>
                          <div className="text-gray-500">{scammer.uniqueReporters} unique reporters</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openScammerDetails(scammer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalScammers)} of {pagination.totalScammers} scammers
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border rounded-md text-sm font-medium ${
                    page === pagination.currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Scammer Details Modal */}
        {showModal && selectedScammer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedScammer.name}</h2>
                    <div className="flex items-center space-x-4 mt-2">
                      {getVerificationBadge(selectedScammer.verificationStatus)}
                      {getRiskBadge(selectedScammer.riskLevel)}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      {selectedScammer.phoneNumber && (
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-900">{selectedScammer.phoneNumber}</span>
                        </div>
                      )}
                      {selectedScammer.email && (
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-900">{selectedScammer.email}</span>
                        </div>
                      )}
                      {selectedScammer.upiId && (
                        <div className="flex items-center">
                          <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-900">{selectedScammer.upiId}</span>
                        </div>
                      )}
                      {selectedScammer.website && (
                        <div className="flex items-center">
                          <Globe className="w-5 h-5 text-gray-400 mr-3" />
                          <a href={selectedScammer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedScammer.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scam Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Scam Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="ml-2 text-gray-900 capitalize">{selectedScammer.scamType.replace('-', ' ')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Reports:</span>
                        <span className="ml-2 text-gray-900">{selectedScammer.reportCount} ({selectedScammer.uniqueReporters} unique)</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Last Reported:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(selectedScammer.lastReportedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700">{selectedScammer.description}</p>
                </div>

                {/* Aliases */}
                {selectedScammer.aliases && selectedScammer.aliases.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Known Aliases</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedScammer.aliases.map((alias, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {alias}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Media Handles */}
                {selectedScammer.socialMediaHandles && selectedScammer.socialMediaHandles.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Handles</h3>
                    <div className="space-y-2">
                      {selectedScammer.socialMediaHandles.map((handle, index) => (
                        <div key={index} className="flex items-center">
                          <span className="font-medium text-gray-700 capitalize mr-2">{handle.platform}:</span>
                          <span className="text-gray-900">{handle.handle}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScammerDatabase;
