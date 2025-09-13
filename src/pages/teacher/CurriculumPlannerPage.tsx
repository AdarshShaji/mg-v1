// src/pages/teacher/CurriculumPlannerPage.tsx (Corrected Version)

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Play, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ActivityCompletionModal } from '../../components/features/curriculum/ActivityCompletionModal';
import { AlternativeActivityModal } from '../../components/features/curriculum/AlternativeActivityModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout'; // FIX: This is the corrected import
import type { PriorityActionItem } from '../../lib/types';

interface GroupedActivity {
  activity_id: string;
  activity_name: string;
  pathway_name: string;
  pathway_id: string;
  step_level: number;
  instruction: string;
  materials_needed: string[];
  assessment_cue: string;
  students: Array<{
    id: string;
    name: string;
  }>;
}

export const CurriculumPlannerPage: React.FC = () => {
  const { user } = useAuth();
  const [groupedActivities, setGroupedActivities] = useState<GroupedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogActivity, setSelectedLogActivity] = useState<GroupedActivity | null>(null);
  const [selectedAlternativeActivity, setSelectedAlternativeActivity] = useState<GroupedActivity | null>(null);

  const fetchActionList = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('priority_action_list_view')
        .select('*');

      if (error) throw error;
      
      const items: PriorityActionItem[] = data || [];

      // Group students by activity
      const grouped = items.reduce((acc: GroupedActivity[], item) => {
        const existingActivity = acc.find(a => a.activity_id === item.activity_id);
        
        if (existingActivity) {
          existingActivity.students.push({
            id: item.student_id,
            name: item.student_name
          });
        } else {
          acc.push({
            activity_id: item.activity_id,
            activity_name: item.activity_name,
            pathway_name: item.pathway_name,
            pathway_id: item.pathway_id,
            step_level: item.step_level,
            instruction: item.instruction || '',
            materials_needed: (item.materials as string[]) || [],
            assessment_cue: item.assessment_cue || '',
            students: [{
              id: item.student_id,
              name: item.student_name
            }]
          });
        }
        
        return acc;
      }, []);
      
      setGroupedActivities(grouped);
    } catch (error) {
      console.error('Error fetching action list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActionList();
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold text-gray-900">Daily Action List</h1>
        <p className="text-gray-600 mt-2 mb-6">Loading your personalized curriculum plan...</p>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-900">Daily Action List</h1>
      <p className="text-gray-600 mt-2 mb-6">
        Your personalized curriculum plan for today. {groupedActivities.length} activities ready.
      </p>
      
      {groupedActivities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Scheduled</h3>
            <p className="text-gray-600">
              All students are up to date with their learning pathways. Great job!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedActivities.map((activity, index) => (
            <motion.div
              key={activity.activity_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start justify-between">
                    <div className="flex-1">
                      {/* Activity Header */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {activity.activity_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {activity.pathway_name} • Step {activity.step_level}
                          </p>
                        </div>
                      </div>

                      {/* Students */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Students ({activity.students.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {activity.students.map((student) => (
                            <span
                              key={student.id}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {student.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="md:ml-6 mt-4 md:mt-0 flex items-center justify-end md:justify-start space-x-2 w-full md:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAlternativeActivity(activity)}
                      >
                        <MoreHorizontal className="w-4 h-4 mr-2" />
                        Alternatives
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelectedLogActivity(activity)}
                        className="flex items-center"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        <span>Log Progress</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {selectedLogActivity && (
        <ActivityCompletionModal
          isOpen={!!selectedLogActivity}
          onClose={() => setSelectedLogActivity(null)}
          activityId={selectedLogActivity.activity_id}
          activityName={selectedLogActivity.activity_name}
          students={selectedLogActivity.students}
          onSuccess={() => {
            setSelectedLogActivity(null);
            fetchActionList();
          }}
        />
      )}

      {selectedAlternativeActivity && (
        <AlternativeActivityModal
          isOpen={!!selectedAlternativeActivity}
          onClose={() => setSelectedAlternativeActivity(null)}
          pathwayId={selectedAlternativeActivity.pathway_id}
          stepLevel={selectedAlternativeActivity.step_level}
          currentActivityName={selectedAlternativeActivity.activity_name}
        />
      )}
    </DashboardLayout>
  );
};