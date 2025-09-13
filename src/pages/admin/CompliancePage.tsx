import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck, 
  MessageSquare, 
  AlertTriangle, 
  Upload, 
  Eye, 
  Download,
  Calendar,
  Filter,
  Search,
  Reply,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

interface Communication {
  id: string;
  sender_name: string;
  sender_role: 'parent' | 'teacher';
  message_type: 'FEEDBACK' | 'COMPLAINT' | 'INQUIRY';
  content: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
}

interface ComplianceRecord {
  id: string;
  record_type: string;
  status: 'Compliant' | 'Pending' | 'Non-Compliant';
  expiry_date?: string;
  document_url?: string;
  created_at: string;
}

const CommunicationCard: React.FC<{
  communication: Communication;
  onReply: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}> = ({ communication, onReply, onUpdateStatus }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'COMPLAINT': return 'bg-red-100 text-red-800';
      case 'FEEDBACK': return 'bg-green-100 text-green-800';
      case 'INQUIRY': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(communication.message_type)}`}>
                {communication.message_type}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(communication.status)}`}>
                {communication.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">
              From: {communication.sender_name} ({communication.sender_role})
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {communication.content}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(communication.created_at).toLocaleDateString()} at {new Date(communication.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex flex-col space-y-2 ml-4">
            <Button size="sm" variant="outline" onClick={() => onReply(communication.id)}>
              <Reply className="w-4 h-4 mr-1" />
              Reply
            </Button>
            {communication.status !== 'resolved' && (
              <select
                value={communication.status}
                onChange={(e) => onUpdateStatus(communication.id, e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ComplianceRecordCard: React.FC<{
  record: ComplianceRecord;
  onView: (id: string) => void;
}> = ({ record, onView }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Non-Compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">{record.record_type}</h3>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(record.status)}`}>
                {record.status}
              </span>
              {isExpiringSoon(record.expiry_date) && (
                <span className="px-2 py-1 text-xs rounded-full font-medium bg-orange-100 text-orange-800">
                  Expiring Soon
                </span>
              )}
              {isExpired(record.expiry_date) && (
                <span className="px-2 py-1 text-xs rounded-full font-medium bg-red-100 text-red-800">
                  Expired
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Created: {new Date(record.created_at).toLocaleDateString()}</p>
              {record.expiry_date && (
                <p>Expires: {new Date(record.expiry_date).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {record.document_url && (
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => onView(record.id)}>
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ReplyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  communicationId: string;
  onSend: (reply: string) => void;
}> = ({ isOpen, onClose, communicationId, onSend }) => {
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!reply.trim()) return;
    
    setIsSending(true);
    try {
      await onSend(reply);
      setReply('');
      onClose();
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reply to Message">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Reply
          </label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your reply here..."
          />
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            loading={isSending}
            disabled={!reply.trim()}
            className="flex-1"
          >
            Send Reply
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const UploadDocumentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: any) => void;
}> = ({ isOpen, onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    record_type: '',
    status: 'Pending' as const,
    expiry_date: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      await onUpload({ ...formData, file });
      setFormData({ record_type: '', status: 'Pending', expiry_date: '' });
      setFile(null);
      onClose();
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Compliance Document">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Document Type"
          value={formData.record_type}
          onChange={(e) => setFormData(prev => ({ ...prev, record_type: e.target.value }))}
          placeholder="e.g., Fire Safety Certificate"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Pending">Pending</option>
            <option value="Compliant">Compliant</option>
            <option value="Non-Compliant">Non-Compliant</option>
          </select>
        </div>

        <Input
          label="Expiry Date (Optional)"
          type="date"
          value={formData.expiry_date}
          onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document File
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit"
            loading={isUploading}
            disabled={!formData.record_type}
            className="flex-1"
          >
            Upload Document
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const CompliancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feedback' | 'complaints' | 'records'>('feedback');
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedCommunicationId, setSelectedCommunicationId] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock communications data
      const mockCommunications: Communication[] = [
        {
          id: '1',
          sender_name: 'Raj Patel',
          sender_role: 'parent',
          message_type: 'FEEDBACK',
          content: 'I wanted to thank Ms. Priya for the excellent work she has been doing with Emma. Emma comes home excited about her activities every day.',
          status: 'new',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          sender_name: 'Ms. Anita Kumar',
          sender_role: 'teacher',
          message_type: 'COMPLAINT',
          content: 'The playground equipment needs urgent attention. The swing set has a loose chain that could be dangerous for the children.',
          status: 'in_progress',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          sender_name: 'Priya Sharma',
          sender_role: 'parent',
          message_type: 'INQUIRY',
          content: 'Could you please provide information about the upcoming parent-teacher conference schedule?',
          status: 'resolved',
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      // Mock compliance records
      const mockRecords: ComplianceRecord[] = [
        {
          id: '1',
          record_type: 'Fire Safety Certificate',
          status: 'Compliant',
          expiry_date: '2025-12-31',
          document_url: '/documents/fire-safety-cert.pdf',
          created_at: '2024-01-15'
        },
        {
          id: '2',
          record_type: 'Health Department License',
          status: 'Compliant',
          expiry_date: '2025-03-15',
          document_url: '/documents/health-license.pdf',
          created_at: '2024-02-01'
        },
        {
          id: '3',
          record_type: 'Building Safety Inspection',
          status: 'Pending',
          expiry_date: '2025-01-30',
          created_at: '2024-11-01'
        }
      ];

      setCommunications(mockCommunications);
      setComplianceRecords(mockRecords);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (communicationId: string) => {
    setSelectedCommunicationId(communicationId);
    setReplyModalOpen(true);
  };

  const handleSendReply = async (reply: string) => {
    // This would call the submit_communication RPC
    console.log('Sending reply:', reply, 'to communication:', selectedCommunicationId);
  };

  const handleUpdateStatus = (communicationId: string, status: string) => {
    setCommunications(prev => 
      prev.map(comm => 
        comm.id === communicationId 
          ? { ...comm, status: status as any }
          : comm
      )
    );
  };

  const handleUploadDocument = async (data: any) => {
    // This would upload to Supabase Storage and create a compliance record
    console.log('Uploading document:', data);
    
    const newRecord: ComplianceRecord = {
      id: Date.now().toString(),
      record_type: data.record_type,
      status: data.status,
      expiry_date: data.expiry_date || undefined,
      document_url: data.file ? '/documents/' + data.file.name : undefined,
      created_at: new Date().toISOString()
    };
    
    setComplianceRecords(prev => [newRecord, ...prev]);
  };

  const handleViewRecord = (recordId: string) => {
    console.log('View record:', recordId);
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comm.status === statusFilter;
    const matchesTab = (activeTab === 'feedback' && comm.message_type === 'FEEDBACK') ||
                      (activeTab === 'complaints' && comm.message_type === 'COMPLAINT') ||
                      (activeTab === 'feedback' && comm.message_type === 'INQUIRY');
    return matchesSearch && matchesStatus && matchesTab;
  });

  const filteredRecords = complianceRecords.filter(record =>
    record.record_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Hub</h1>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compliance Hub</h1>
        <p className="text-gray-600 mt-2">
          Manage communications, feedback, and compliance documents
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {communications.filter(c => c.status === 'new').length}
            </p>
            <p className="text-sm text-gray-600">New Messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {communications.filter(c => c.message_type === 'COMPLAINT' && c.status !== 'resolved').length}
            </p>
            <p className="text-sm text-gray-600">Open Complaints</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {complianceRecords.filter(r => r.status === 'Compliant').length}
            </p>
            <p className="text-sm text-gray-600">Compliant Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {complianceRecords.filter(r => {
                if (!r.expiry_date) return false;
                const expiry = new Date(r.expiry_date);
                const today = new Date();
                const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return diffDays <= 30;
              }).length}
            </p>
            <p className="text-sm text-gray-600">Expiring Soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('feedback')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'feedback'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Feedback & Inquiries
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'complaints'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Complaints
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'records'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Compliance Records
          </button>
        </nav>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={activeTab === 'records' ? 'Search documents...' : 'Search messages...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab !== 'records' && (
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            )}
            {activeTab === 'records' && (
              <Button onClick={() => setUploadModalOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <div>
        {activeTab === 'records' ? (
          <div>
            {filteredRecords.map((record) => (
              <ComplianceRecordCard
                key={record.id}
                record={record}
                onView={handleViewRecord}
              />
            ))}
            {filteredRecords.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? 'Try adjusting your search criteria.' : 'Upload your first compliance document.'}
                  </p>
                  <Button onClick={() => setUploadModalOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div>
            {filteredCommunications.map((communication) => (
              <CommunicationCard
                key={communication.id}
                communication={communication}
                onReply={handleReply}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
            {filteredCommunications.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Found</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : `No ${activeTab} messages at the moment.`
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ReplyModal
        isOpen={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        communicationId={selectedCommunicationId}
        onSend={handleSendReply}
      />

      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadDocument}
      />
    </div>
  );
};