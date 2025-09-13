// src/pages/admin/StudentsPage.tsx (Final, Corrected Version)

import React, { useState, useEffect } from 'react'; // FIX: Corrected import syntax
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, UserPlus, Search, Filter, Eye } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { Student } from '../../lib/types';
import DashboardLayout from '../../components/layout/DashboardLayout';

const StudentCard: React.FC<{ student: Student; onViewProfile: (studentId: string) => void; }> = ({ student, onViewProfile }) => {
  const getAgeFromDOB = (dob: string | null) => {
    if (!dob) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getCategoryColor = (category?: string | null) => {
    switch (category) {
      case 'HEL': return 'bg-green-100 text-green-800';
      case 'BLSN': return 'bg-blue-100 text-blue-800';
      case 'HSL': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Card hover className="cursor-pointer" onClick={() => onViewProfile(student.id)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">
                  {student.child_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{student.child_name}</h3>
                <p className="text-sm text-gray-600">
                  Age {getAgeFromDOB(student.date_of_birth)} • {student.class || 'No Class'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getCategoryColor(student.category)}`}>
                {student.category || 'N/A'}
              </span>
              <div className="flex space-x-1">
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onViewProfile(student.id); }}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const StudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select(`id, school_id, child_name, date_of_birth, class, status, student_assessments(category)`)
        .eq('school_id', user.school_id)
        .eq('status', 'active');
      if (error) throw error;
      const transformedData = data.map(s => ({ ...s, category: s.student_assessments[0]?.category || null }));
      setStudents(transformedData);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudent = () => navigate('/admin/students/enroll');
  const handleViewProfile = (studentId: string) => navigate(`/student/${studentId}`);

  const filteredStudents = students.filter(student => 
    student.child_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterClass === 'all' || student.class === filterClass)
  );
  
  const uniqueClasses = Array.from(new Set(students.map(s => s.class).filter(Boolean)));
  const categoryCounts = {
    HEL: students.filter(s => s.category === 'HEL').length,
    BLSN: students.filter(s => s.category === 'BLSN').length,
    HSL: students.filter(s => s.category === 'HSL').length
  };

  if (loading) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-600 mt-2">Manage your school's students and track their progress</p>
        </div>
        <Button onClick={handleEnrollStudent}><UserPlus className="w-4 h-4 mr-2" /><span>Enroll New Student</span></Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card><CardContent className="p-4 text-center"><Users className="w-8 h-8 text-blue-600 mx-auto mb-2" /><p className="text-2xl font-bold">{students.length}</p><p className="text-sm text-gray-600">Total Students</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-green-600 font-bold text-sm">HEL</span></div><p className="text-2xl font-bold">{categoryCounts.HEL}</p><p className="text-sm text-gray-600">High Engagement</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-blue-600 font-bold text-sm">BLSN</span></div><p className="text-2xl font-bold">{categoryCounts.BLSN}</p><p className="text-sm text-gray-600">Balanced Learning</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-orange-600 font-bold text-sm">HSL</span></div><p className="text-2xl font-bold">{categoryCounts.HSL}</p><p className="text-sm text-gray-600">High Support</p></CardContent></Card>
      </div>
      <Card className="mb-6"><CardContent className="p-4"><div className="flex flex-col md:flex-row gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><Input placeholder="Search students by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/></div><div className="flex items-center space-x-2"><Filter className="w-4 h-4 text-gray-500" /><select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"><option value="all">All Classes</option>{uniqueClasses.map(cls => (<option key={cls} value={cls}>{cls}</option>))}</select></div></div></CardContent></Card>
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (<StudentCard key={student.id} student={student} onViewProfile={handleViewProfile}/>))}
        </div>
      ) : (
        <Card><CardContent className="text-center py-12"><Users className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3><p className="text-gray-600 mb-4">{searchTerm || filterClass !== 'all' ? 'Try adjusting your search or filter criteria.' : 'Get started by enrolling your first student.'}</p><Button onClick={handleEnrollStudent}><UserPlus className="w-4 h-4 mr-2" />Enroll New Student</Button></CardContent></Card>
      )}
    </DashboardLayout>
  );
};