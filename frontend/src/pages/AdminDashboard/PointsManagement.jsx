import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Award, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { axiosInstance } from '../../stores/axios';
import { toast } from 'react-hot-toast';

const PointsManagement = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');
  const [pointsToDeduct, setPointsToDeduct] = useState(100);
  const [pointsToAward, setPointsToAward] = useState(200);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(false);

  const filters = [
    { key: 'all', label: 'All Incidents', color: 'bg-gray-500' },
    { key: 'reported', label: 'Reported', color: 'bg-blue-500' },
    { key: 'under_review', label: 'Under Review', color: 'bg-yellow-500' },
    { key: 'resolved', label: 'Resolved', color: 'bg-green-500' },
    { key: 'fake', label: 'Fake', color: 'bg-red-500' },
  ];

  useEffect(() => {
    fetchIncidents();
  }, [filter]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/view-incidents');

      if (response.data.success) {
        setIncidents(response.data.incidents || []);
      } else {
        toast.error('Failed to fetch incidents');
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (incidentId, action) => {
    if (!reason.trim()) {
      toast.error('Please provide a reason/notes');
      return;
    }

    if (action === 'fake' && pointsToDeduct <= 0) {
      toast.error('Points to deduct must be greater than 0');
      return;
    }

    if (action === 'genuine' && pointsToAward <= 0) {
      toast.error('Points to award must be greater than 0');
      return;
    }

    try {
      setProcessing(true);
      let response;

      if (action === 'fake') {
        response = await axiosInstance.post(`/points/mark-fake/${incidentId}`, {
          reason: reason,
          pointsToDeduct: pointsToDeduct
        });
      } else if (action === 'genuine') {
        response = await axiosInstance.post(`/points/approve-genuine/${incidentId}`, {
          cyberCellNotes: reason,
          pointsToAward: pointsToAward
        });
      }

      if (response.data.success) {
        toast.success(response.data.message || 'Action completed successfully');
        setShowModal(false);
        setReason('');
        setPointsToDeduct(100);
        setPointsToAward(200);
        fetchIncidents();
      } else {
        toast.error(response.data.message || 'Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error(error.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (incident, action) => {
    setSelectedIncident(incident);
    setActionType(action);
    setReason('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedIncident(null);
    setActionType('');
    setReason('');
    setPointsToDeduct(100);
    setPointsToAward(200);
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesFilter = filter === 'all' || incident.status === filter;
    const matchesSearch = searchTerm === '' || 
      incident.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.reportedBy?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.reportedBy?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'reported': 'bg-blue-100 text-blue-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-green-100 text-green-800',
      'fake': 'bg-red-100 text-red-800',
      'forwarded_to_cyber_cell': 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fake':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'under_review':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Eye className="w-4 h-4 text-blue-500" />;
    }
  };

  const renderIncidentCard = (incident) => (
    <div key={incident._id} className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {getStatusIcon(incident.status)}
            <h3 className="text-lg font-semibold text-gray-800">{incident.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(incident.status)}`}>
              {incident.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <p className="text-gray-600 mb-3 line-clamp-2">{incident.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {incident.reportedBy?.firstName} {incident.reportedBy?.lastName}
            </span>
            <span>•</span>
            <span>{new Date(incident.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {incident.severity}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2 ml-4">
          {incident.status !== 'resolved' && incident.status !== 'fake' && (
            <>
              <button
                onClick={() => openModal(incident, 'genuine')}
                className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                title="Approve as genuine"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </button>
              
              <button
                onClick={() => openModal(incident, 'fake')}
                className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                title="Mark as fake"
              >
                <XCircle className="w-4 h-4" />
                <span>Mark Fake</span>
              </button>
            </>
          )}
          
          <button
            onClick={() => setSelectedIncident(incident)}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-800">Points Management</h1>
          </div>
          <p className="text-gray-600">Manage user points by reviewing incidents and content</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filterItem) => (
                <button
                  key={filterItem.key}
                  onClick={() => setFilter(filterItem.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    filter === filterItem.key
                      ? `${filterItem.color} text-white shadow-lg`
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {filterItem.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Incidents List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Incidents Review</h2>
            <div className="flex items-center space-x-2 text-gray-600">
              <AlertTriangle className="w-5 h-5" />
              <span>{filteredIncidents.length} incidents</span>
            </div>
          </div>

          {filteredIncidents.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No incidents found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredIncidents.map(renderIncidentCard)
          )}
        </div>

        {/* Action Modal */}
        {showModal && selectedIncident && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center space-x-2 mb-4">
                {actionType === 'fake' ? (
                  <XCircle className="w-6 h-6 text-red-500" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
                <h3 className="text-lg font-bold text-gray-800">
                  {actionType === 'fake' ? 'Mark as Fake' : 'Approve as Genuine'}
                </h3>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === 'fake' ? 'Reason for marking as fake:' : 'Cyber cell notes:'}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder={actionType === 'fake' ? 'Enter reason...' : 'Enter notes for cyber cell...'}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points to {actionType === 'fake' ? 'deduct' : 'award'}:
                </label>
                <input
                  type="number"
                  value={actionType === 'fake' ? pointsToDeduct : pointsToAward}
                  onChange={(e) => actionType === 'fake' ? setPointsToDeduct(parseInt(e.target.value) || 0) : setPointsToAward(parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleAction(selectedIncident._id, actionType)}
                  disabled={processing}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold text-white transition-colors ${
                    actionType === 'fake' 
                      ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-300' 
                      : 'bg-green-500 hover:bg-green-600 disabled:bg-green-300'
                  } disabled:cursor-not-allowed`}
                >
                  {processing ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : (
                    actionType === 'fake' ? 'Mark as Fake' : 'Approve & Forward'
                  )}
                </button>
                <button
                  onClick={closeModal}
                  disabled={processing}
                  className="flex-1 py-2 px-4 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsManagement;
