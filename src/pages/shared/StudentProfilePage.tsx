import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  MessageCircle, 
  Star,
  Activity,
  Target,
  Clock,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { studentApi } from '../../lib/api';
import type { Student } from '../../lib/types';

interface PathwayProgress {
  id: string;
  pathway_name: string;
  goal_description: string;
  current_step: number;
  total_steps: number;
  status: 'in_progress' | 'mastered' | 'not_started';
  started_at: string;
  mastered_at?: string;
}

interface ActivityLog {
  id: string;
  activity_name: string;
  outcome: 'mastered' | 'practicing' | 'struggling';
  engagement_level: 'low' | 'medium' | 'high';
  logged_at: string;
  teacher_name: string;
}

const ProgressBar: React.FC<{ progress: number; className?: string }> = ({ progress, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(progress, 100)}%` }}
    ></div>
  </div>
);

const PathwayCard: React.FC<{ pathway: PathwayProgress }> = ({ pathway }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'not_started': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const progress = (pathway.current_step / pathway.total_steps) * 100;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">{pathway.pathway_name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{pathway.goal_description}</p>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full font-medium ml-2 ${getStatusColor(pathway.status)}`}>
            {pathway.status === 'in_progress' ? 'In Progress' : 
             pathway.status === 'mastered' ? 'Mastered' : 'Not Started'}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Step {pathway.current_step} of {pathway.total_steps}</span>
            <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
          </div>
          <ProgressBar progress={progress} />
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>Started: {new Date(pathway.started_at).toLocaleDateString()}</span>
          {pathway.mastered_at && (
            <span>Completed: {new Date(pathway.mastered_at).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityLogCard: React.FC<{ log: ActivityLog }> = ({ log }) => {
  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'mastered': return 'bg-green-100 text-green-800';
      case 'practicing': return 'bg-blue-100 text-blue-800';
      case 'struggling': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900">{log.activity_name}</h4>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getOutcomeColor(log.outcome)}`}>
            {log.outcome}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getEngagementColor(log.engagement_level)}`}>
            {log.engagement_level} engagement
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>By {log.teacher_name}</span>
        <span>{new Date(log.logged_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

const GenerateHighlightModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  onSend: (message: string) => void;
}> = ({ isOpen, onClose, studentName, onSend }) => {
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // This would call the generate_positive_highlight RPC
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGeneratedText(`${studentName} showed wonderful progress today! They demonstrated excellent focus during the fine motor activities and helped a classmate who was struggling. Their enthusiasm for learning continues to shine through in everything they do. Keep up the great work!`);
    } catch (error) {
      console.error('Error generating highlight:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!generatedText.trim()) return;
    
    setIsSending(true);
    try {
      await onSend(generatedText);
      onClose();
      setGeneratedText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleGenerate();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Positive Highlight">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          AI will generate a positive message about {studentName} based on their recent activities and progress.
        </p>
        
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Generating highlight...</span>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generated Message (You can edit this before sending)
            </label>
            <textarea
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Generated message will appear here..."
            />
          </div>
        )}
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            loading={isSending}
            disabled={!generatedText.trim() || isGenerating}
            className="flex-1"
          >
            Send to Parent
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [pathways, setPathways] = useState<PathwayProgress[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightModalOpen, setHighlightModalOpen] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Mock student data
      const mockStudent: Student = {
        id: studentId || '1',
        school_id: 'school-1',
        child_name: 'Emma Johnson',
        date_of_birth: '2020-03-15',
        gender: 'Female',
        class: 'Pre-Nursery',
        enrollment_date: '2024-01-15',
        status: 'active'
      };

      // Mock pathway progress
      const mockPathways: PathwayProgress[] = [
        {
          id: '1',
          pathway_name: 'Fine Motor Development',
          goal_description: 'Develop precise hand and finger movements for writing readiness',
          current_step: 3,
          total_steps: 5,
          status: 'in_progress',
          started_at: '2024-01-20'
        },
        {
          id: '2',
          pathway_name: 'Language Skills',
          goal_description: 'Build vocabulary and communication abilities',
          current_step: 5,
          total_steps: 5,
          status: 'mastered',
          started_at: '2024-01-15',
          mastered_at: '2024-11-20'
        },
        {
          id: '3',
          pathway_name: 'Social Emotional Learning',
          goal_description: 'Develop emotional regulation and social interaction skills',
          current_step: 2,
          total_steps: 4,
          status: 'in_progress',
          started_at: '2024-02-01'
        }
      ];

      // Mock activity logs
      const mockLogs: ActivityLog[] = [
        {
          id: '1',
          activity_name: 'Scissor Snipping Practice',
          outcome: 'practicing',
          engagement_level: 'high',
          logged_at: '2024-12-10',
          teacher_name: 'Ms. Priya'
        },
        {
          id: '2',
          activity_name: 'Story Circle Time',
          outcome: 'mastered',
          engagement_level: 'high',
          logged_at: '2024-12-09',
          teacher_name: 'Ms. Priya'
        },
        {
          id: '3',
          activity_name: 'Color Sorting Activity',
          outcome: 'struggling',
          engagement_level: 'medium',
          logged_at: '2024-12-08',
          teacher_name: 'Ms. Anita'
        }
      ];

      setStudent(mockStudent);
      setPathways(mockPathways);
      setActivityLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendHighlight = async (message: string) => {
    // This would send the message to the parent
    console.log('Sending highlight to parent:', message);
  };

  const getAgeFromDOB = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-600 mt-2">Loading student information...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-600 mt-2">Student not found.</p>
        </div>
      </div>
    );
  }

  const masteredPathways = pathways.filter(p => p.status === 'mastered').length;
  const inProgressPathways = pathways.filter(p => p.status === 'in_progress').length;
  const recentMasteredActivities = activityLogs.filter(log => log.outcome === 'mastered').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{student.child_name}</h1>
          <p className="text-gray-600 mt-2">Student Profile & Progress Tracking</p>
        </div>
        <Button onClick={() => setHighlightModalOpen(true)}>
          <Star className="w-4 h-4 mr-2" />
          Generate Positive Highlight
        </Button>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-2xl">
                {student.child_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{student.child_name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Age</p>
                  <p className="font-medium">{getAgeFromDOB(student.date_of_birth)} years</p>
                </div>
                <div>
                  <p className="text-gray-600">Class</p>
                  <p className="font-medium">{student.class || 'Not Assigned'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Gender</p>
                  <p className="font-medium">{student.gender || 'Not Specified'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Enrolled</p>
                  <p className="font-medium">{new Date(student.enrollment_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{masteredPathways}</p>
            <p className="text-sm text-gray-600">Pathways Mastered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{inProgressPathways}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{recentMasteredActivities}</p>
            <p className="text-sm text-gray-600">Recent Achievements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{activityLogs.length}</p>
            <p className="text-sm text-gray-600">Total Activities</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Pathways */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Learning Pathways</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pathways.map((pathway) => (
              <PathwayCard key={pathway.id} pathway={pathway} />
            ))}
          </div>
          {pathways.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No learning pathways assigned yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity Logs</h2>
            <Button variant="outline" size="sm">
              <Clock className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activityLogs.slice(0, 5).map((log) => (
              <ActivityLogCard key={log.id} log={log} />
            ))}
          </div>
          {activityLogs.length === 0 && (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No activity logs recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Highlight Modal */}
      <GenerateHighlightModal
        isOpen={highlightModalOpen}
        onClose={() => setHighlightModalOpen(false)}
        studentName={student.child_name}
        onSend={handleSendHighlight}
      />
    </div>
  );
};