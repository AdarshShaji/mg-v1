import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, TrendingUp, Users, Eye, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { aiApi } from '../../../lib/api';
import type { AIAlert } from '../../../lib/types';

interface AlertCardProps {
  alert: AIAlert;
  onDismiss: (alertId: string) => void;
  onView: (alertId: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onDismiss, onView }) => {
  const getAlertIcon = () => {
    switch (alert.alert_type) {
      case 'STUDENT_AT_RISK':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'STUDENT_STRUGGLING':
        return <TrendingUp className="w-6 h-6 text-orange-600" />;
      case 'STUDENT_DISENGAGED':
        return <Users className="w-6 h-6 text-yellow-600" />;
      case 'TEACHER_SUPPORT_NEEDED':
        return <Users className="w-6 h-6 text-blue-600" />;
      case 'POSITIVE_HIGHLIGHT':
        return <TrendingUp className="w-6 h-6 text-green-600" />;
      default:
        return <Brain className="w-6 h-6 text-gray-600" />;
    }
  };

  const getAlertColor = () => {
    switch (alert.alert_type) {
      case 'STUDENT_AT_RISK':
        return 'border-red-200 bg-red-50';
      case 'STUDENT_STRUGGLING':
        return 'border-orange-200 bg-orange-50';
      case 'STUDENT_DISENGAGED':
        return 'border-yellow-200 bg-yellow-50';
      case 'TEACHER_SUPPORT_NEEDED':
        return 'border-blue-200 bg-blue-50';
      case 'POSITIVE_HIGHLIGHT':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatAlertTitle = () => {
    switch (alert.alert_type) {
      case 'STUDENT_AT_RISK':
        return `Student At Risk: ${alert.details.student_name}`;
      case 'STUDENT_STRUGGLING':
        return `Student Struggling: ${alert.details.student_name}`;
      case 'STUDENT_DISENGAGED':
        return `Low Engagement: ${alert.details.student_name}`;
      case 'TEACHER_SUPPORT_NEEDED':
        return `Teacher Support: ${alert.details.teacher_name}`;
      case 'POSITIVE_HIGHLIGHT':
        return `Great Progress: ${alert.details.student_name}`;
      default:
        return 'AI Insight';
    }
  };

  const formatAlertDescription = () => {
    switch (alert.alert_type) {
      case 'STUDENT_STRUGGLING':
        return `${alert.details.consecutive_struggles} consecutive struggling logs in ${alert.details.pathway_name}. ${alert.details.recommendation}`;
      case 'POSITIVE_HIGHLIGHT':
        return alert.details.highlight;
      case 'TEACHER_SUPPORT_NEEDED':
        return `${alert.details.issue}. ${alert.details.suggestion}`;
      default:
        return JSON.stringify(alert.details);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border rounded-lg p-4 ${getAlertColor()}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getAlertIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">
              {formatAlertTitle()}
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              {formatAlertDescription()}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{new Date(alert.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span className={`px-2 py-1 rounded-full ${
                alert.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {alert.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {alert.status === 'new' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(alert.id)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDismiss(alert.id)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export const CoPilotDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const alertsData = await aiApi.getAdminCoPilotFeed();
      setAlerts(alertsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI insights');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAlert = async (alertId: string) => {
    try {
      await aiApi.updateAlertStatus(alertId, 'viewed');
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'viewed' } : alert
      ));
    } catch (err) {
      console.error('Error updating alert status:', err);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await aiApi.updateAlertStatus(alertId, 'dismissed');
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI Co-Pilot Dashboard</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI Co-Pilot Dashboard</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchAlerts} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI Co-Pilot Dashboard</h2>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAlerts}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-600">
              No urgent insights at the moment. Your school is running smoothly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {alerts.filter(a => a.status === 'new').length} new insights, {alerts.length} total
              </p>
            </div>
            
            <div className="space-y-3">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onView={handleViewAlert}
                  onDismiss={handleDismissAlert}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};