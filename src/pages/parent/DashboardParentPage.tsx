import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Camera, BookOpen, Calendar, MessageCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const DailyDigestCard: React.FC<{
  childName: string;
  highlight: string;
  learningGoal: string;
  conversationStarter: string;
  imageUrl?: string;
}> = ({ childName, highlight, learningGoal, conversationStarter, imageUrl }) => (
  <Card className="overflow-hidden">
    <CardContent className="p-0">
      {imageUrl && (
        <div className="h-48 bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
          <Camera className="w-12 h-12 text-blue-600" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900">{childName}'s Daily Highlight</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-900 font-medium">✨ Today's Highlight</p>
            <p className="text-blue-800 mt-1">{highlight}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Learning Focus:</p>
            <p className="text-sm text-gray-600">{learningGoal}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-green-900 font-medium">💬 Ask your child:</p>
            <p className="text-green-800 mt-1 italic">"{conversationStarter}"</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const MilestoneCard: React.FC<{
  skill: string;
  progress: number;
  status: 'in_progress' | 'mastered' | 'not_started';
  nextStep?: string;
}> = ({ skill, progress, status, nextStep }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-medium text-gray-900">{skill}</h4>
      <span className={`px-2 py-1 text-xs rounded-full ${
        status === 'mastered' ? 'bg-green-100 text-green-800' :
        status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
        'bg-gray-100 text-gray-600'
      }`}>
        {status === 'mastered' ? 'Mastered' : 
         status === 'in_progress' ? 'In Progress' : 'Not Started'}
      </span>
    </div>
    
    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{progress}% Complete</span>
      {nextStep && (
        <span className="text-blue-600">Next: {nextStep}</span>
      )}
    </div>
  </div>
);

export const DashboardParentPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dailyDigest = {
    childName: "Emma",
    highlight: "Emma showed amazing focus during today's scissor cutting activity and helped a friend who was struggling. She's developing both fine motor skills and empathy!",
    learningGoal: "We're working on precision and control with cutting tools, which helps develop the small muscles needed for writing.",
    conversationStarter: "What was your favorite part about helping your friend today?",
    imageUrl: "https://images.pexels.com/photos/8613311/pexels-photo-8613311.jpeg"
  };

  const learningJourney = [
    { skill: 'Fine Motor Development', progress: 75, status: 'in_progress' as const, nextStep: 'Button fastening' },
    { skill: 'Language Skills', progress: 90, status: 'in_progress' as const, nextStep: 'Story retelling' },
    { skill: 'Social Emotional', progress: 100, status: 'mastered' as const },
    { skill: 'Cognitive Development', progress: 60, status: 'in_progress' as const, nextStep: 'Pattern recognition' },
    { skill: 'Gross Motor Skills', progress: 85, status: 'in_progress' as const, nextStep: 'Balance beam' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Parent Connection Hub</h1>
        <p className="text-gray-600 mt-2">Stay connected with Emma's learning journey and celebrate her daily wins!</p>
      </div>

      {/* Daily Digest */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DailyDigestCard {...dailyDigest} />
      </motion.div>

      {/* Learning Journey */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Emma's Learning Journey</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningJourney.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MilestoneCard {...milestone} />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* At-Home Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">At-Home Activities</h2>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">🎯 This Week's Focus: Fine Motor Skills</h3>
              <p className="text-green-800 text-sm mb-3">
                Help Emma practice her cutting skills with these fun activities!
              </p>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Cut out shapes from colored paper</li>
                <li>• Make paper snowflakes together</li>
                <li>• Create a collage with magazine cutouts</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">📚 Language Building</h3>
              <p className="text-blue-800 text-sm">
                Ask Emma to tell you about her day using "first," "then," and "finally" to help her organize thoughts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Calendar Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message Teacher
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              <span onClick={() => navigate('/calendar')}>View School Calendar</span>
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Heart className="w-4 h-4 mr-2" />
              Share Feedback
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Parent-Teacher Conference</p>
                  <p className="text-xs text-gray-600">Tomorrow, 3:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Art & Craft Exhibition</p>
                  <p className="text-xs text-gray-600">Friday, 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Sports Day</p>
                  <p className="text-xs text-gray-600">Next Monday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};