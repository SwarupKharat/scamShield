import React, { useState, useEffect } from 'react';
import { Search, Copy, AlertTriangle, Phone, Mail, CreditCard, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ScamWatchlist = () => {
    const [scams, setScams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [region, setRegion] = useState('all');

    useEffect(() => {
        fetchScams();
    }, [region]);

    const fetchScams = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (region !== 'all') queryParams.append('region', region);

            const response = await fetch(`http://localhost:5000/api/scammer/recent?${queryParams}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setScams(data.scammers || []);
            }
        } catch (error) {
            console.error('Error fetching scams:', error);
            // Mock data for demonstration
            setScams([
                {
                    _id: '1',
                    identifier: '+91-9876543210',
                    type: 'phone',
                    scamType: 'Phishing',
                    communityReports: 342,
                    lastReported: '2024-10-22',
                    verified: true,
                    severity: 'high'
                },
                {
                    _id: '2',
                    identifier: 'fraudster@okhdfcbank',
                    type: 'upi',
                    scamType: 'Fake Investment',
                    communityReports: 287,
                    lastReported: '2024-10-21',
                    verified: true,
                    severity: 'high'
                },
                {
                    _id: '3',
                    identifier: 'scammer@example.com',
                    type: 'email',
                    scamType: 'Romance Scam',
                    communityReports: 156,
                    lastReported: '2024-10-20',
                    verified: false,
                    severity: 'medium'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'phone': return <Phone className="w-4 h-4" />;
            case 'email': return <Mail className="w-4 h-4" />;
            case 'upi': return <CreditCard className="w-4 h-4" />;
            case 'website': return <Globe className="w-4 h-4" />;
            default: return <AlertTriangle className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'phone': return 'bg-red-100 text-red-800';
            case 'email': return 'bg-blue-100 text-blue-800';
            case 'upi': return 'bg-green-100 text-green-800';
            case 'website': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'border-l-red-500';
            case 'medium': return 'border-l-yellow-500';
            case 'low': return 'border-l-green-500';
            default: return 'border-l-gray-500';
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const filteredScams = scams.filter(scam => {
        const matchesSearch = scam.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            scam.scamType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || scam.type === filterType;
        return matchesSearch && matchesFilter;
    });

    const filterTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'phone', label: 'Phone Numbers' },
        { value: 'email', label: 'Emails' },
        { value: 'upi', label: 'UPI IDs' },
        { value: 'website', label: 'Websites' }
    ];

    const regions = [
        { value: 'all', label: 'All Regions' },
        { value: 'North', label: 'North India' },
        { value: 'South', label: 'South India' },
        { value: 'East', label: 'East India' },
        { value: 'West', label: 'West India' },
        { value: 'Central', label: 'Central India' },
        { value: 'Northeast', label: 'Northeast India' }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Reported Scams</h2>
                <p className="text-gray-600">Stay informed about the latest scam reports in your region</p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by phone, email, UPI ID, or website..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                    {filterTypes.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setFilterType(filter.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === filter.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Region Filter */}
                <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Region:</label>
                    <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {regions.map((reg) => (
                            <option key={reg.value} value={reg.value}>
                                {reg.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Scam List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredScams.length === 0 ? (
                <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No scam reports found</p>
                    <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredScams.map((scam, index) => (
                        <div
                            key={scam._id}
                            className={`border-l-4 ${getSeverityColor(scam.severity)} bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow`}
                        >
                            {/* Header Row */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-mono">
                                        SCAM{String(index + 1).padStart(3, '0')}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-sm font-medium ${getTypeColor(scam.type)}`}>
                                        {scam.type === 'phone' ? 'Phone Number' :
                                            scam.type === 'email' ? 'Email' :
                                                scam.type === 'upi' ? 'UPI ID' :
                                                    scam.type === 'website' ? 'Website' : scam.type}
                                    </span>
                                    {scam.verified && (
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(scam.identifier)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Identifier */}
                            <div className="mb-3">
                                <div className="text-xl font-bold text-gray-900 flex items-center">
                                    {getTypeIcon(scam.type)}
                                    <span className="ml-2">{scam.identifier}</span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="border-t border-gray-200 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-500">Scam Type</label>
                                        <p className="font-semibold text-gray-900">{scam.scamType}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Community Reports</label>
                                        <p className="font-semibold text-gray-900">{scam.communityReports} reports</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Last Reported</label>
                                        <p className="font-semibold text-gray-900">{scam.lastReported}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ScamWatchlist;
