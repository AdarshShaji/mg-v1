import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, DollarSign, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useModuleStatus } from '../../hooks/useModuleStatus';
import { CoPilotDashboard } from '../../components/features/co-pilot/CoPilotDashboard';

const StatCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
}> = ({ icon: Icon, title, value, change, changeType }) => (
  <Card hover>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AlertCard: React.FC<{
  title: string;
  description: string;
  type: 'warning' | 'info';
}> = ({ title, description, type }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          type === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
        }`}>
          <AlertTriangle className={`w-4 h-4 ${
            type === 'warning' ? 'text-orange-600' : 'text-blue-600'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const DashboardAdminPage: React.FC = () => {
  const { user } = useAuth();
  const hasAICoPilot = useModuleStatus('AI_COPILOT');
  const hasFinancials = useModuleStatus('FINANCIALS');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}. Here's what's happening at your school.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Students"
          value="234"
          change="+12 this month"
          changeType="positive"
        />
        <StatCard
          icon={BookOpen}
          title="Active Pathways"
          value="18"
          change="2 completed this week"
          changeType="positive"
        />
        {hasFinancials && (
          <StatCard
            icon={DollarSign}
            title="Monthly Revenue"
            value="₹2,45,600"
            change="+8.3% from last month"
            changeType="positive"
          />
        )}
        <StatCard
          icon={TrendingUp}
          title="School Score"
          value="94%"
          change="+2% this quarter"
          changeType="positive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Co-Pilot Section */}
        <div className="lg:col-span-2">
          {hasAICoPilot ? (
            <CoPilotDashboard />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Unlock AI Co-Pilot</h2>
                  <Button size="sm" variant="outline">
                    Upgrade Now
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl mx-auto flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Transform Your School with AI</h3>
                  <p className="text-gray-600 mb-4">
                    Get proactive insights about student progress, teacher support needs, and learning opportunities.
                  </p>
                  <Button>Activate AI Co-Pilot</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Add New Student
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Event
              </Button>
              {hasFinancials && (
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    New student <span className="font-medium">Emma Johnson</span> enrolled
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    Teacher <span className="font-medium">Ms. Priya</span> logged progress for 12 students
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    Parent feedback received from <span className="font-medium">Raj Patel</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};