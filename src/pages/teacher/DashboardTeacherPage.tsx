import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, TrendingUp, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const FocusStudentCard: React.FC<{
  name: string;
  issue: string;
  pathway: string;
}> = ({ name, issue, pathway }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-orange-50 border border-orange-200 rounded-lg p-4"
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium text-orange-900">{name}</h3>
        <p className="text-sm text-orange-700">{issue}</p>
        <p className="text-xs text-orange-600 mt-1">{pathway}</p>
      </div>
      <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
        <span className="text-orange-800 font-semibold text-sm">
          {name.split(' ').map(n => n[0]).join('')}
        </span>
      </div>
    </div>
  </motion.div>
);

const ActivityCard: React.FC<{
  title: string;
  students: string[];
  pathway: string;
  step: number;
}> = ({ title, students, pathway, step }) => (
  <Card hover>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{pathway} • Step {step}</p>
          <div className="flex items-center space-x-2 mt-2">
            <Users className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-600">{students.length} students</p>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {students.slice(0, 3).map((student, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
              >
                {student}
              </span>
            ))}
            {students.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{students.length - 3} more
              </span>
            )}
          </div>
        </div>
        <div className="ml-4">
          <Button size="sm" variant="outline">
            Start Activity
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const DashboardTeacherPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const focusStudents = [
    { name: 'Leo Kumar', issue: 'Struggling with engagement', pathway: 'Fine Motor Skills' },
    { name: 'Arya Sharma', issue: 'Behind on milestones', pathway: 'Language Development' },
  ];

  const todaysActivities = [
    {
      title: 'Scissor Snipping Practice',
      students: ['Emma', 'Raj', 'Priya', 'Sam'],
      pathway: 'Fine Motor Development',
      step: 3
    },
    {
      title: 'Story Circle Time',
      students: ['Leo', 'Maya', 'Arjun'],
      pathway: 'Language Skills',
      step: 2
    },
    {
      title: 'Color Sorting Activity',
      students: ['Aniya', 'Dev', 'Tara', 'Om', 'Riya'],
      pathway: 'Cognitive Development',
      step: 1
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-2">Good morning, {user?.name}! Ready for another great day of learning?</p>
      </div>

      {/* Today's Huddle - Focus Students */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Today's Huddle - Focus Students</h2>
            </div>
          </CardHeader>
          <CardContent>
            {focusStudents.length > 0 ? (
              <div className="space-y-3">
                {focusStudents.map((student, index) => (
                  <FocusStudentCard key={index} {...student} />
                ))}
                <div className="pt-2">
                  <p className="text-sm text-gray-600">
                    💡 Give these students extra attention today. Their progress will help improve overall class engagement.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Star className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-green-600 font-medium">Great job! No students need special focus today.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">24</p>
            <p className="text-sm text-gray-600">Students Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">8</p>
            <p className="text-sm text-gray-600">Activities Planned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">92%</p>
            <p className="text-sm text-gray-600">Mastery Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">2.5</p>
            <p className="text-sm text-gray-600">Avg Log Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activity Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Today's Activity Plan</h2>
            <Button variant="outline" size="sm">
              View Full Planner
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todaysActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ActivityCard {...activity} />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="w-4 h-4 mr-2" />
              <span onClick={() => navigate('/teacher/planner')}>Open Curriculum Planner</span>
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              View All Students
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              <span onClick={() => navigate('/calendar')}>Check Today's Schedule</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Recent Progress</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Activities Completed</span>
                <span className="font-semibold text-green-600">15/18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Students Mastered Skills</span>
                <span className="font-semibold text-blue-600">22</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Parent Messages Sent</span>
                <span className="font-semibold text-purple-600">8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};