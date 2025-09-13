import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useModuleStatus } from '../../hooks/useModuleStatus';

interface FeeStructure {
  id: string;
  structure_name: string;
  academic_year: string;
  total_tuition_fee: number;
  annual_charges: number;
  is_active: boolean;
  created_at: string;
}

interface PaymentPlan {
  id: string;
  fee_structure_id: string;
  plan_name: string;
  number_of_installments: number;
  discount_percentage: number;
}

interface FinancialTransaction {
  id: string;
  student_id: string;
  student_name: string;
  transaction_type: 'FEE' | 'EXPENSE';
  amount: number;
  status: 'PAID' | 'DUE' | 'OVERDUE';
  due_date?: string;
  paid_at?: string;
  description?: string;
  created_at: string;
}

const TransactionCard: React.FC<{
  transaction: FinancialTransaction;
  onLogPayment: (id: string) => void;
}> = ({ transaction, onLogPayment }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'DUE': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="w-4 h-4" />;
      case 'DUE': return <Clock className="w-4 h-4" />;
      case 'OVERDUE': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium text-gray-900">{transaction.student_name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center space-x-1 ${getStatusColor(transaction.status)}`}>
                {getStatusIcon(transaction.status)}
                <span>{transaction.status}</span>
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>₹{transaction.amount.toLocaleString()}</span>
                <span>({transaction.transaction_type})</span>
              </p>
              {transaction.due_date && (
                <p className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {new Date(transaction.due_date).toLocaleDateString()}</span>
                </p>
              )}
              {transaction.paid_at && (
                <p className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Paid: {new Date(transaction.paid_at).toLocaleDateString()}</span>
                </p>
              )}
              {transaction.description && (
                <p className="text-gray-500">{transaction.description}</p>
              )}
            </div>
          </div>
          <div className="ml-4">
            {transaction.status !== 'PAID' && (
              <Button size="sm" onClick={() => onLogPayment(transaction.id)}>
                <CreditCard className="w-4 h-4 mr-1" />
                Log Payment
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CreateFeeStructureModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    structure_name: '',
    academic_year: '',
    total_tuition_fee: '',
    annual_charges: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // This would call the API to create a fee structure
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess();
      onClose();
      setFormData({ structure_name: '', academic_year: '', total_tuition_fee: '', annual_charges: '' });
    } catch (error) {
      console.error('Error creating fee structure:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Fee Structure">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Structure Name"
          value={formData.structure_name}
          onChange={(e) => setFormData(prev => ({ ...prev, structure_name: e.target.value }))}
          placeholder="e.g., Academic Year 2025-26 Fees"
          required
        />

        <Input
          label="Academic Year"
          value={formData.academic_year}
          onChange={(e) => setFormData(prev => ({ ...prev, academic_year: e.target.value }))}
          placeholder="e.g., 2025-26"
          required
        />

        <Input
          label="Total Tuition Fee (₹)"
          type="number"
          value={formData.total_tuition_fee}
          onChange={(e) => setFormData(prev => ({ ...prev, total_tuition_fee: e.target.value }))}
          placeholder="e.g., 50000"
          required
        />

        <Input
          label="Annual Charges (₹)"
          type="number"
          value={formData.annual_charges}
          onChange={(e) => setFormData(prev => ({ ...prev, annual_charges: e.target.value }))}
          placeholder="e.g., 5000"
        />

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isSubmitting}
            disabled={!formData.structure_name || !formData.academic_year || !formData.total_tuition_fee}
            className="flex-1"
          >
            Create Structure
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const LogPaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  onSuccess: () => void;
}> = ({ isOpen, onClose, transactionId, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // This would call the API to log the payment
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess();
      onClose();
      setFormData({ amount: '', payment_date: new Date().toISOString().split('T')[0], description: '' });
    } catch (error) {
      console.error('Error logging payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Payment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Amount Paid (₹)"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          placeholder="Enter amount"
          required
        />

        <Input
          label="Payment Date"
          type="date"
          value={formData.payment_date}
          onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Payment method, reference number, etc."
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isSubmitting}
            disabled={!formData.amount}
            className="flex-1"
          >
            Log Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const FinancialManagementPage: React.FC = () => {
  const hasFinancials = useModuleStatus('FINANCIALS');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'structures'>('overview');
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createStructureModalOpen, setCreateStructureModalOpen] = useState(false);
  const [logPaymentModalOpen, setLogPaymentModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState('');

  useEffect(() => {
    if (hasFinancials) {
      fetchData();
    }
  }, [hasFinancials]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock transactions data
      const mockTransactions: FinancialTransaction[] = [
        {
          id: '1',
          student_id: '1',
          student_name: 'Emma Johnson',
          transaction_type: 'FEE',
          amount: 12500,
          status: 'DUE',
          due_date: '2025-01-15',
          description: 'Q1 Tuition Fee',
          created_at: '2024-12-01'
        },
        {
          id: '2',
          student_id: '2',
          student_name: 'Raj Patel',
          transaction_type: 'FEE',
          amount: 12500,
          status: 'PAID',
          due_date: '2025-01-15',
          paid_at: '2025-01-10',
          description: 'Q1 Tuition Fee',
          created_at: '2024-12-01'
        },
        {
          id: '3',
          student_id: '3',
          student_name: 'Priya Sharma',
          transaction_type: 'FEE',
          amount: 12500,
          status: 'OVERDUE',
          due_date: '2024-12-15',
          description: 'Q4 Tuition Fee',
          created_at: '2024-11-01'
        }
      ];

      // Mock fee structures
      const mockStructures: FeeStructure[] = [
        {
          id: '1',
          structure_name: 'Academic Year 2025-26 Fees',
          academic_year: '2025-26',
          total_tuition_fee: 50000,
          annual_charges: 5000,
          is_active: true,
          created_at: '2024-03-01'
        }
      ];

      setTransactions(mockTransactions);
      setFeeStructures(mockStructures);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogPayment = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setLogPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    // Update the transaction status to PAID
    setTransactions(prev => 
      prev.map(t => 
        t.id === selectedTransactionId 
          ? { ...t, status: 'PAID' as const, paid_at: new Date().toISOString() }
          : t
      )
    );
  };

  const handleCreateStructureSuccess = () => {
    fetchData();
  };

  if (!hasFinancials) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-2">This module is not activated for your school.</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Management Suite</h3>
            <p className="text-gray-600 mb-4">
              Activate the Financial Management module to access fee structures, payment tracking, and financial reporting.
            </p>
            <Button>Activate Module</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-2">Loading financial data...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const totalRevenue = transactions
    .filter(t => t.status === 'PAID' && t.transaction_type === 'FEE')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter(t => t.status !== 'PAID' && t.transaction_type === 'FEE')
    .reduce((sum, t) => sum + t.amount, 0);

  const overdueAmount = transactions
    .filter(t => t.status === 'OVERDUE')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-2">
            Manage fees, payments, and financial records
          </p>
        </div>
        <Button onClick={() => setCreateStructureModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Fee Structure
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">₹{pendingAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Pending Payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">₹{overdueAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Overdue Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Receipt className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            <p className="text-sm text-gray-600">Total Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('structures')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'structures'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Fee Structures
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'transactions' && (
        <>
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by student name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="PAID">Paid</option>
                    <option value="DUE">Due</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <div>
            {filteredTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onLogPayment={handleLogPayment}
              />
            ))}
            {filteredTransactions.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No transactions recorded yet.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {activeTab === 'structures' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feeStructures.map((structure) => (
              <Card key={structure.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{structure.structure_name}</h3>
                    {structure.is_active && (
                      <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Academic Year: {structure.academic_year}</p>
                    <p>Tuition Fee: ₹{structure.total_tuition_fee.toLocaleString()}</p>
                    <p>Annual Charges: ₹{structure.annual_charges.toLocaleString()}</p>
                    <p>Total: ₹{(structure.total_tuition_fee + structure.annual_charges).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {feeStructures.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Fee Structures</h3>
                <p className="text-gray-600 mb-4">Create your first fee structure to get started.</p>
                <Button onClick={() => setCreateStructureModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Fee Structure
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.student_name}</p>
                      <p className="text-sm text-gray-600">₹{transaction.amount.toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      transaction.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'DUE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Fee Structures</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feeStructures.map((structure) => (
                  <div key={structure.id} className="p-3 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900">{structure.structure_name}</h3>
                    <p className="text-sm text-gray-600">
                      ₹{(structure.total_tuition_fee + structure.annual_charges).toLocaleString()} total
                    </p>
                  </div>
                ))}
                {feeStructures.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No fee structures created yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals */}
      <CreateFeeStructureModal
        isOpen={createStructureModalOpen}
        onClose={() => setCreateStructureModalOpen(false)}
        onSuccess={handleCreateStructureSuccess}
      />

      <LogPaymentModal
        isOpen={logPaymentModalOpen}
        onClose={() => setLogPaymentModalOpen(false)}
        transactionId={selectedTransactionId}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};