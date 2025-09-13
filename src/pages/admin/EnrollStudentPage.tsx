// src/pages/admin/EnrollStudentPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { FormData } from '../../lib/types';

export const EnrollStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 2; // Simplified for this example: 1. Form, 2. Review

  const [formData, setFormData] = useState<Partial<FormData>>({
    learning_style: [],
    family_dynamics: [],
    cultural_values: [],
    concerns: [],
    goals: []
  });

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!user) {
      alert("Authentication error: Could not identify the current admin.");
      return;
    }

    setIsSubmitting(true);
    try {
      const assessmentData = {
        school_id: user.school_id,
        facilitator_name: user.name,
        child_name: formData.child_name,
        class: formData.class,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        assessment_data: formData, 
        ai_status: 'pending'
      };

      const { data: newAssessment, error: insertError } = await supabase
        .from('student_assessments')
        .insert(assessmentData)
        .select('id, student_id')
        .single();

      if (insertError) throw insertError;
      if (!newAssessment) throw new Error("Could not create new student record.");

      // Invoke the AI function and wait for the result to show the success page
      const { data: aiResult, error: invokeError } = await supabase.functions.invoke('process-enrollment', {
        body: { assessment_id: newAssessment.id },
      });
      if (invokeError) throw invokeError;
      
      navigate(`/admin/students/enroll/success`, { 
        replace: true,
        state: { studentName: formData.child_name, aiData: aiResult } 
      });

    } catch (error: any) {
      console.error('❌ Error submitting enrollment:', error);
      alert(`Error submitting enrollment: ${error.message}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Step {currentStep}: {currentStep === 1 ? "Student & Parent Details" : "Review & Submit"}
            </h2>
            
            {currentStep === 1 && (
              <div className="mt-6 space-y-4">
                <Input label="Child's Full Name" value={formData.child_name || ''} onChange={(e) => updateFormData('child_name', e.target.value)} required />
                <Input label="Date of Birth" type="date" value={formData.date_of_birth || ''} onChange={(e) => updateFormData('date_of_birth', e.target.value)} required />
                <Input label="Class" value={formData.class || ''} onChange={(e) => updateFormData('class', e.target.value)} required />
                <Input label="Parent's Name" value={formData.father_name || ''} onChange={(e) => updateFormData('father_name', e.target.value)} required />
                <textarea className="w-full p-2 border rounded" placeholder="Parental Concerns (e.g., Speech Delay, Shyness)" onChange={(e) => updateFormData('concerns', e.target.value.split(','))}></textarea>
                <textarea className="w-full p-2 border rounded" placeholder="Child's Interests (e.g., Dinosaurs, Building)" onChange={(e) => updateFormData('interests', e.target.value)}></textarea>
              </div>
            )}

            {currentStep === 2 && (
              <div className="mt-6">
                <p>Please review the information before submitting.</p>
                {/* A summary of formData would be displayed here */}
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                <ChevronLeft size={16} className="mr-2" /> Previous
              </Button>
              {currentStep < totalSteps ? (
                <Button onClick={nextStep}>
                  Next <ChevronRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} loading={isSubmitting}>
                  <Check size={16} className="mr-2" /> Submit Enrollment
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};