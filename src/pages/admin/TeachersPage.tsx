import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Mail, Phone, Calendar, UserPlus, Eye, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { teacherApi } from '../../lib/api';
import type { Teacher } from '../../lib/types';

const TeacherCard: React.FC<{
  teacher: Teacher;
  onViewProfile: (teacherId: string) => void;
}> = ({ teacher, onViewProfile }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card hover className="cursor-pointer" onClick={() => onViewProfile(teacher.id)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-lg">
                  {teacher.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <Mail className="w-4 h-4" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(teacher.status || 'active')}`}>
                {(teacher.status || 'active').charAt(0).toUpperCase() + (teacher.status || 'active').slice(1)}
              </span>
              <div className="flex space-x-1">
                <Button size="sm" variant="ghost" onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile(teacher.id);
                }}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AddTeacherModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // This would integrate with Supabase Auth to create a new teacher
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess();
      onClose();
      setFormData({ name: '', email: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to create teacher account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Teacher">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter teacher's full name"
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter teacher's email"
        />

        <Input
          label="Temporary Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Create a temporary password"
          helperText="The teacher will be asked to change this on first login"
        />

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isSubmitting}
            disabled={!formData.name || !formData.email || !formData.password}
            className="flex-1"
          >
            Create Teacher Account
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockTeachers: Teacher[] = [
        {
          id: '1',
          auth_id: 'auth-1',
          school_id: 'school-1',
          name: 'Ms. Priya Sharma',
          email: 'priya@demo.school',
          status: 'active'
        },
        {
          id: '2',
          auth_id: 'auth-2',
          school_id: 'school-1',
          name: 'Mr. Raj Kumar',
          email: 'raj@demo.school',
          status: 'active'
        },
        {
          id: '3',
          auth_id: 'auth-3',
          school_id: 'school-1',
          name: 'Ms. Anita Patel',
          email: 'anita@demo.school',
          status: 'active'
        }
      ];
      setTeachers(mockTeachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (teacherId: string) => {
    console.log('View profile for teacher:', teacherId);
  };

  const handleAddSuccess = () => {
    fetchTeachers();
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers Management</h1>
          <p className="text-gray-600 mt-2">Loading teachers...</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your teaching staff and their access
          </p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
            <p className="text-sm text-gray-600">Total Teachers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold text-sm">✓</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {teachers.filter(t => t.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {teachers.filter(t => true).length}
            </p>
            <p className="text-sm text-gray-600">This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search teachers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teachers List */}
      <div className="space-y-4">
        {filteredTeachers.map((teacher) => (
          <TeacherCard
            key={teacher.id}
            teacher={teacher}
            onViewProfile={handleViewProfile}
          />
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Teachers Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Get started by adding your first teacher.'
              }
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Teacher
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Teacher Modal */}
      <AddTeacherModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};