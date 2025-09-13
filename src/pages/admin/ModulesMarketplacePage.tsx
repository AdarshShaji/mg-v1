import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Check, Star, Zap, DollarSign, Brain, BarChart3, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { modulesApi } from '../../lib/api';
import type { GroveModule } from '../../lib/types';

interface ModuleCardProps {
  module: GroveModule;
  isUnlocked: boolean;
  onActivate: (moduleId: string) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, isUnlocked, onActivate }) => {
  const getModuleIcon = () => {
    switch (module.id) {
      case 'AI_COPILOT':
        return <Brain className="w-8 h-8 text-purple-600" />;
      case 'FINANCIALS':
        return <DollarSign className="w-8 h-8 text-green-600" />;
      case 'PARENT_PLUS':
        return <Heart className="w-8 h-8 text-pink-600" />;
      case 'CURRICULUM_ADVANCED':
        return <Zap className="w-8 h-8 text-blue-600" />;
      case 'ANALYTICS_PRO':
        return <BarChart3 className="w-8 h-8 text-orange-600" />;
      default:
        return <Star className="w-8 h-8 text-gray-600" />;
    }
  };

  const getModulePrice = () => {
    switch (module.id) {
      case 'AI_COPILOT':
        return '₹2,999/month';
      case 'FINANCIALS':
        return '₹1,499/month';
      case 'PARENT_PLUS':
        return '₹999/month';
      case 'CURRICULUM_ADVANCED':
        return '₹1,999/month';
      case 'ANALYTICS_PRO':
        return '₹1,799/month';
      default:
        return '₹999/month';
    }
  };

  const getModuleFeatures = () => {
    switch (module.id) {
      case 'AI_COPILOT':
        return [
          'Proactive student risk alerts',
          'Teacher support recommendations',
          'Automated progress insights',
          'Predictive analytics dashboard'
        ];
      case 'FINANCIALS':
        return [
          'Fee structure management',
          'Payment tracking & reminders',
          'Financial reporting',
          'Expense management'
        ];
      case 'PARENT_PLUS':
        return [
          'Daily learning digests',
          'Photo & video sharing',
          'At-home activity suggestions',
          'Progress visualization'
        ];
      case 'CURRICULUM_ADVANCED':
        return [
          'Differentiated instruction',
          'Alternative activity suggestions',
          'Personalized learning paths',
          'Assessment analytics'
        ];
      case 'ANALYTICS_PRO':
        return [
          'Custom report builder',
          'Franchise-wide comparisons',
          'Advanced data visualization',
          'Export capabilities'
        ];
      default:
        return ['Feature 1', 'Feature 2', 'Feature 3'];
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={`h-full ${isUnlocked ? 'ring-2 ring-green-200 bg-green-50' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getModuleIcon()}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{module.module_name}</h3>
                {isUnlocked && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                )}
              </div>
            </div>
            {module.id === 'AI_COPILOT' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                Flagship
              </span>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm">{module.description}</p>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Key Features:</h4>
            <ul className="space-y-1">
              {getModuleFeatures().map((feature, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{getModulePrice()}</p>
                <p className="text-sm text-gray-500">per school</p>
              </div>
              
              {isUnlocked ? (
                <Button disabled className="bg-green-100 text-green-800">
                  <Check className="w-4 h-4 mr-2" />
                  Activated
                </Button>
              ) : (
                <Button onClick={() => onActivate(module.id)}>
                  Activate Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ModulesMarketplacePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [modules, setModules] = useState<GroveModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const modulesData = await modulesApi.getAvailableModules();
      setModules(modulesData);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateModule = async (moduleId: string) => {
    if (!user?.school_id) return;
    
    try {
      await modulesApi.activateModule(user.school_id, moduleId);
      await refreshUser(); // Refresh user context to update unlocked modules
      
      // Show success message (you could use a toast library here)
      alert(`${modules.find(m => m.id === moduleId)?.module_name} has been activated!`);
    } catch (error) {
      console.error('Error activating module:', error);
      alert('Failed to activate module. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grove Modules Marketplace</h1>
          <p className="text-gray-600 mt-2">Loading available modules...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const unlockedModules = user?.unlocked_modules || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <Store className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Grove Modules Marketplace</h1>
        </div>
        <p className="text-gray-600">
          Enhance your school management experience with powerful add-on modules. 
          You currently have {unlockedModules.length} modules activated.
        </p>
      </div>

      {/* Current Plan Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Current Plan</h2>
              <p className="text-gray-600">
                Core Platform + {unlockedModules.length} Premium Module{unlockedModules.length !== 1 ? 's' : ''}
              </p>
              {unlockedModules.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {unlockedModules.map((moduleId) => {
                    const module = modules.find(m => m.id === moduleId);
                    return module ? (
                      <span
                        key={moduleId}
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        {module.module_name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ₹{unlockedModules.length * 1500 + 999}/month
              </p>
              <p className="text-sm text-gray-500">Current billing</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Modules */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              isUnlocked={unlockedModules.includes(module.id)}
              onActivate={handleActivateModule}
            />
          ))}
        </div>
      </div>

      {/* Support Section */}
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help Choosing?</h3>
          <p className="text-gray-600 mb-4">
            Our team can help you select the right modules for your school's needs.
          </p>
          <Button variant="outline">
            Schedule a Consultation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};