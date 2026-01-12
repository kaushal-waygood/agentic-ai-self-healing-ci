'use client';

import React, { useEffect, useState } from 'react';
import apiInstance from '@/services/api';
import {
  Building2,
  GraduationCap,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Mail,
  Phone,
} from 'lucide-react';

// Define the shape of your API data
interface AccessRequest {
  _id: string;
  user: string;
  type: 'COMPANY' | 'STUDENT';
  university?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  role?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const AccessRequestsPage = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'STUDENT' | 'COMPANY'>(
    'ALL',
  );
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const getAllAccessRequests = async () => {
      try {
        const response = await apiInstance.get('/bring-zobs');
        if (response.data && response.data.success) {
          setRequests(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching access requests:', error);
      } finally {
        setLoading(false);
      }
    };

    getAllAccessRequests();
  }, []);

  // Filter Logic
  const filteredRequests = requests.filter((req) => {
    const matchesType = filterType === 'ALL' || req.type === filterType;
    const matchesSearch =
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTypeIcon = (type: string) => {
    if (type === 'COMPANY')
      return <Building2 className="w-4 h-4 text-blue-600" />;
    return <GraduationCap className="w-4 h-4 text-emerald-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-slate-500 text-sm">Loading requests...</p>
      </div>
    );
  }

  const handleAccepted = async (id: string) => {
    console.log(id);
    try {
      const response = await apiInstance.post(`/bring-zobs/accepted/${id}`);
      console.log(response);
    } catch (error) {
      console.error('Error accepting access request:', error);
    }
  };

  const handleRejected = async (id: string) => {
    console.log(id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Access Requests</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage incoming requests from students and organizations.
          </p>
        </div>

        {/* Stats Cards (Optional Polish) */}
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
            <span className="text-xs text-slate-500 font-medium uppercase">
              Pending
            </span>
            <p className="text-xl font-bold text-slate-800">
              {requests.filter((r) => r.status === 'PENDING').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-lg w-full md:w-auto">
          {['ALL', 'STUDENT', 'COMPANY'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab as any)}
              className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                filterType === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-medium">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Organization / University</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Requested Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr
                    key={req._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* User Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                          {req.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {req.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {req.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {req.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          req.type === 'COMPANY'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}
                      >
                        {getTypeIcon(req.type)}
                        {req.type === 'COMPANY' ? 'Partner' : 'Student'}
                      </div>
                    </td>

                    {/* Context Specific Details */}
                    <td className="px-6 py-4">
                      {req.type === 'COMPANY' ? (
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {req.company}
                          </p>
                          <p className="text-xs text-slate-500">
                            Role: {req.role}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {req.university || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500">
                            University Student
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          req.status,
                        )}`}
                      >
                        {req.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {formatDate(req.createdAt)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Approve"
                          onClick={() => handleAccepted(req._id)}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                          onClick={() => handleRejected(req._id)}
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Filter className="w-8 h-8 text-slate-300" />
                      <p>No requests found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccessRequestsPage;
