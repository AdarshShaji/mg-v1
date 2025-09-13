import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Zap, Palette, Music, Users } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { curriculumApi } from '../../../lib/api';

interface Activity {
  id: string;
  activity_name: string;
  difficulty_level: 'foundational' | 'core' | 'extension';
  modality: string;
  instruction: string;
  materials_needed: string[];
  assessment_cue?: string;
}

interface AlternativeActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  pathwayId: string;
  stepLevel: number;
  currentActivityName: string;
}

export const AlternativeActivityModal: React.FC<AlternativeActivityModalProps> = ({
  isOpen,
  onClose,
  pathwayId,
  stepLevel,
  currentActivityName
}) => {
  const [alternatives, setAlternatives] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  useEffect(() => {
    if (isOpen && pathwayId && stepLevel) {
      fetchAlternatives();
    }
  }, [isOpen, pathwayId, stepLevel]);

  const fetchAlternatives = async () => {
    try {
      setLoading(true);
      // For now, using mock data since the RPC function needs to be implemented
      const mockAlternatives: Activity[] = [
        {
          id: '1',
          activity_name: 'Chunky Crayon Control (Foundational)',
          difficulty_level: 'foundational',
          modality: 'kinesthetic',
          instruction: 'Use thick crayons to make large circular motions on paper. Focus on whole-hand grip and arm movement.',
          materials_needed: ['Thick crayons', 'Large paper sheets', 'Table'],
          assessment_cue: 'Look for controlled circular motions and proper grip'
        },
        {
          id: '2',
          activity_name: 'Tracing Straight Lines (Extension)',
          difficulty_level: 'extension',
          modality: 'visual-motor',
          instruction: 'Trace straight lines between two points using a pencil. Start with short lines and progress to longer ones.',
          materials_needed: ['Pencils', 'Tracing worksheets', 'Ruler'],
          assessment_cue: 'Check for straight lines with minimal deviation'
        },
        {
          id: '3',
          activity_name: 'Finger Paint Patterns (Creative)',
          difficulty_level: 'core',
          modality: 'sensory',
          instruction: 'Create patterns using finger paints. Focus on controlled finger movements and pattern recognition.',
          materials_needed: ['Finger paints', 'Paper', 'Wet wipes', 'Aprons'],
          assessment_cue: 'Observe finger control and pattern completion'
        },
        {
          id: '4',
          activity_name: 'Sand Tray Writing (Sensory)',
          difficulty_level: 'core',
          modality: 'tactile',
          instruction: 'Practice pre-writing strokes in a sand tray using fingers. Focus on sensory feedback and muscle memory.',
          materials_needed: ['Sand tray', 'Fine sand', 'Smoothing tool'],
          assessment_cue: 'Look for consistent stroke patterns and finger control'
        }
      ];
      setAlternatives(mockAlternatives);
    } catch (error) {
      console.error('Error fetching alternatives:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'foundational': return 'bg-green-100 text-green-800';
      case 'core': return 'bg-blue-100 text-blue-800';
      case 'extension': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getModalityIcon = (modality: string) => {
    switch (modality.toLowerCase()) {
      case 'kinesthetic': return <Users className="w-4 h-4" />;
      case 'visual-motor': return <BookOpen className="w-4 h-4" />;
      case 'sensory': return <Palette className="w-4 h-4" />;
      case 'tactile': return <Music className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
      onClick={() => setSelectedActivity(activity)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900 flex-1">{activity.activity_name}</h3>
        <div className="flex items-center space-x-2 ml-2">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getDifficultyColor(activity.difficulty_level)}`}>
            {activity.difficulty_level}
          </span>
          <div className="flex items-center space-x-1 text-gray-500">
            {getModalityIcon(activity.modality)}
            <span className="text-xs">{activity.modality}</span>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {activity.instruction}
      </p>
      
      <div className="flex flex-wrap gap-1">
        {activity.materials_needed.slice(0, 3).map((material, index) => (
          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            {material}
          </span>
        ))}
        {activity.materials_needed.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            +{activity.materials_needed.length - 3} more
          </span>
        )}
      </div>
    </motion.div>
  );

  const ActivityDetailView: React.FC<{ activity: Activity }> = ({ activity }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{activity.activity_name}</h2>
        <Button variant="ghost" onClick={() => setSelectedActivity(null)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-3">
        <span className={`px-3 py-1 text-sm rounded-full font-medium ${getDifficultyColor(activity.difficulty_level)}`}>
          {activity.difficulty_level.charAt(0).toUpperCase() + activity.difficulty_level.slice(1)}
        </span>
        <div className="flex items-center space-x-2 text-gray-600">
          {getModalityIcon(activity.modality)}
          <span className="text-sm">{activity.modality}</span>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
        <p className="text-gray-700">{activity.instruction}</p>
      </div>
      
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Materials Needed</h3>
        <div className="flex flex-wrap gap-2">
          {activity.materials_needed.map((material, index) => (
            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {material}
            </span>
          ))}
        </div>
      </div>
      
      {activity.assessment_cue && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-900 mb-1">What to Look For</h3>
          <p className="text-yellow-800 text-sm">{activity.assessment_cue}</p>
        </div>
      )}
      
      <div className="flex space-x-3 pt-4">
        <Button variant="outline" onClick={() => setSelectedActivity(null)} className="flex-1">
          Back to Alternatives
        </Button>
        <Button className="flex-1">
          Use This Activity
        </Button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6">
        {!selectedActivity ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Alternative Activities</h2>
                <p className="text-gray-600 mt-1">
                  Current activity: <span className="font-medium">{currentActivityName}</span>
                </p>
              </div>
              <Button variant="ghost" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Alternatives Grid */}
            {!loading && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Choose an alternative activity that better fits your students' needs or energy level today.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {alternatives.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
                
                {alternatives.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Alternatives Available</h3>
                    <p className="text-gray-600">
                      No alternative activities found for this step. The current activity is the only option available.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            {!loading && alternatives.length > 0 && (
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={onClose}>
                  Keep Current Activity
                </Button>
              </div>
            )}
          </>
        ) : (
          <ActivityDetailView activity={selectedActivity} />
        )}
      </div>
    </Modal>
  );
};