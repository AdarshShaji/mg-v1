import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Clock, Star } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { curriculumApi } from '../../../lib/api';
import type { ActivityOutcome, EngagementLevel } from '../../../lib/types';

interface Student {
  id: string;
  name: string;
}

interface ActivityCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  activityName: string;
  students: Student[];
  onSuccess: () => void;
}

interface StudentLog {
  student_id: string;
  activity_id: string;
  outcome: ActivityOutcome;
  engagement_level: EngagementLevel;
  activity_rating?: number;
}

export const ActivityCompletionModal: React.FC<ActivityCompletionModalProps> = ({
  isOpen,
  onClose,
  activityId,
  activityName,
  students,
  onSuccess
}) => {
  const [logs, setLogs] = useState<Record<string, Partial<StudentLog>>>({});
  const [activityRating, setActivityRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateStudentLog = (studentId: string, field: keyof StudentLog, value: any) => {
    setLogs(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare logs data
      const logsData = students.map(student => ({
        student_id: student.id,
        activity_id: activityId,
        outcome: logs[student.id]?.outcome || 'practicing',
        engagement_level: logs[student.id]?.engagement_level || 'medium',
        activity_rating: activityRating > 0 ? activityRating : null
      }));

      // Submit activity logs
      await curriculumApi.logActivityOutcomes(logsData);

      // Update progress for students who mastered the activity
      const masteredUpdates = logsData
        .filter(log => log.outcome === 'mastered')
        .map(log => ({
          student_id: log.student_id,
          pathway_id: activityId // This would need to be derived from the activity
        }));

      if (masteredUpdates.length > 0) {
        await curriculumApi.updateStudentProgress(masteredUpdates);
      }

      onSuccess();
      onClose();
      
      // Reset form
      setLogs({});
      setActivityRating(0);
    } catch (error) {
      console.error('Error submitting activity logs:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = students.every(student => 
    logs[student.id]?.outcome && logs[student.id]?.engagement_level
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Log Activity Progress</h2>
            <p className="text-gray-600 mt-1">{activityName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Activity Rating */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Rate This Activity</h3>
          </div>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setActivityRating(rating)}
                className={`w-8 h-8 rounded-full transition-colors ${
                  rating <= activityRating
                    ? 'bg-yellow-400 text-white'
                    : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                }`}
              >
                <Star className="w-4 h-4 mx-auto" fill={rating <= activityRating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        {/* Student Logs */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Student Progress ({students.length} students)</h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {students.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <h4 className="font-medium text-gray-900 mb-3">{student.name}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Outcome Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Outcome
                    </label>
                    <div className="flex space-x-2">
                      {(['mastered', 'practicing', 'struggling'] as ActivityOutcome[]).map((outcome) => (
                        <button
                          key={outcome}
                          onClick={() => updateStudentLog(student.id, 'outcome', outcome)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            logs[student.id]?.outcome === outcome
                              ? outcome === 'mastered'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : outcome === 'practicing'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-orange-100 text-orange-800 border-orange-300'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          } border`}
                        >
                          {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Engagement Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Engagement
                    </label>
                    <div className="flex space-x-2">
                      {(['low', 'medium', 'high'] as EngagementLevel[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => updateStudentLog(student.id, 'engagement_level', level)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            logs[student.id]?.engagement_level === level
                              ? level === 'high'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : level === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                : 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          } border`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Quick 15-second log</span>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!isFormValid}
            >
              Save Progress
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};