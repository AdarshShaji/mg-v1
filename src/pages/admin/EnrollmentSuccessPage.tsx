// src/pages/admin/EnrollmentSuccessPage.tsx

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Brain, Sparkles, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const EnrollmentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentName, aiData } = location.state || {};

  if (!aiData) {
    return <DashboardLayout><p>No enrollment data found.</p></DashboardLayout>;
  }

  const { summary, recommendedPathways } = aiData;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <div className="text-center p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Enrollment Submitted for {studentName}!</h1>
            <p className="mt-2 text-gray-600">Our AI has analyzed the assessment and generated an initial profile and learning plan.</p>
          </div>
          <div className="p-8 border-t grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold flex items-center mb-4">
                <Brain className="w-6 h-6 mr-2 text-primary" /> AI-Generated Initial Profile
              </h2>
              <div className="space-y-4">
                {summary.focus_areas.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-800">Primary Areas for Focus:</h3>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      {summary.focus_areas.map((area: any, index: number) => (
                        <li key={index}><strong>{area.category}:</strong> {area.reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.strengths.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-800">Key Strengths Noted:</h3>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      {summary.strengths.map((strength: string, index: number) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-800">Reported Interests:</h3>
                  <p className="text-gray-600 mt-1">{summary.interests}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center mb-4">
                <Sparkles className="w-6 h-6 mr-2 text-yellow-500" /> Day One Pathway Recommendations
              </h2>
              {recommendedPathways.length > 0 ? (
                <div className="space-y-3">
                  {recommendedPathways.map((pathway: any) => (
                    <div key={pathway.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-gray-900">{pathway.pathway_name}</p>
                      <p className="text-sm text-gray-500">{pathway.problem_category}</p>
                    </div>
                  ))}
                  <p className="text-sm text-green-600 mt-4">These pathways have been assigned, and the first activities are now in the teacher's daily plan.</p>
                </div>
              ) : (
                <p className="text-gray-600">No specific pathways were recommended. You can assign them manually from the student's profile.</p>
              )}
            </div>
          </div>
          <div className="p-6 border-t text-right">
            <Button onClick={() => navigate('/admin/students')}>
              <span>View All Students</span> <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};