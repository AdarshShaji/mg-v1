import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Filter,
  Users,
  BookOpen,
  Bell,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { calendarApi } from '../../lib/api';
import type { SchoolEvent } from '../../lib/types';

interface CalendarEvent extends SchoolEvent {
  type: 'school_event' | 'learning_focus' | 'milestone';
  color: string;
}

const EventCard: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'school_event': return <Bell className="w-4 h-4" />;
      case 'learning_focus': return <BookOpen className="w-4 h-4" />;
      case 'milestone': return <Users className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className={`p-2 rounded-md text-xs ${event.color} mb-1 cursor-pointer hover:opacity-80 transition-opacity`}>
      <div className="flex items-center space-x-1">
        {getEventIcon(event.type)}
        <span className="font-medium truncate">{event.title}</span>
      </div>
      {event.start_time && (
        <div className="flex items-center space-x-1 mt-1 opacity-75">
          <Clock className="w-3 h-3" />
          <span>{new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )}
    </div>
  );
};

const CreateEventModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSuccess: () => void;
}> = ({ isOpen, onClose, selectedDate, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    audience: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedDate && isOpen) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        start_time: `${dateStr}T09:00`,
        end_time: `${dateStr}T10:00`
      }));
    }
  }, [selectedDate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // This would call the API to create a school event
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess();
      onClose();
      setFormData({ title: '', description: '', start_time: '', end_time: '', audience: [] });
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAudienceChange = (audience: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      audience: checked 
        ? [...prev.audience, audience]
        : prev.audience.filter(a => a !== audience)
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create School Event">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Event Title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., Parent-Teacher Conference"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Event details..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Time"
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
            required
          />
          <Input
            label="End Time"
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audience
          </label>
          <div className="space-y-2">
            {['all', 'parents', 'teachers', 'admins'].map((audience) => (
              <label key={audience} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.audience.includes(audience)}
                  onChange={(e) => handleAudienceChange(audience, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{audience}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isSubmitting}
            disabled={!formData.title || !formData.start_time}
            className="flex-1"
          >
            Create Event
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [viewFilter, setViewFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Mock events data based on user role
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          school_id: 'school-1',
          title: 'Parent-Teacher Conference',
          description: 'Individual meetings with parents',
          start_time: new Date(2024, 11, 15, 14, 0).toISOString(),
          end_time: new Date(2024, 11, 15, 17, 0).toISOString(),
          audience: ['parents', 'teachers'],
          created_at: '2024-12-01',
          type: 'school_event',
          color: 'bg-blue-100 text-blue-800'
        },
        {
          id: '2',
          school_id: 'school-1',
          title: 'Art & Craft Exhibition',
          description: 'Showcase of student artwork',
          start_time: new Date(2024, 11, 20, 10, 0).toISOString(),
          end_time: new Date(2024, 11, 20, 12, 0).toISOString(),
          audience: ['all'],
          created_at: '2024-12-01',
          type: 'school_event',
          color: 'bg-green-100 text-green-800'
        },
        {
          id: '3',
          school_id: 'school-1',
          title: 'Fine Motor Skills Focus',
          description: 'Weekly learning focus for teachers',
          start_time: new Date(2024, 11, 16, 9, 0).toISOString(),
          end_time: new Date(2024, 11, 22, 17, 0).toISOString(),
          audience: ['teachers'],
          created_at: '2024-12-01',
          type: 'learning_focus',
          color: 'bg-purple-100 text-purple-800'
        }
      ];

      // Add parent-specific events if user is a parent
      if (user?.role === 'parent') {
        mockEvents.push({
          id: '4',
          school_id: 'school-1',
          title: 'Emma\'s Milestone: Language Skills',
          description: 'Projected mastery completion',
          start_time: new Date(2024, 11, 25, 0, 0).toISOString(),
          end_time: new Date(2024, 11, 25, 23, 59).toISOString(),
          audience: ['parents'],
          created_at: '2024-12-01',
          type: 'milestone',
          color: 'bg-yellow-100 text-yellow-800'
        });
      }

      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === targetDate.toDateString();
    });
  };

  const handleDateClick = (date: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
    setSelectedDate(clickedDate);
    if (user?.role === 'admin') {
      setCreateEventModalOpen(true);
    }
  };

  const handleCreateEventSuccess = () => {
    fetchEvents();
  };

  const filteredEvents = events.filter(event => {
    if (viewFilter === 'all') return true;
    return event.type === viewFilter;
  });

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Calendar</h1>
          <p className="text-gray-600 mt-2">Loading calendar...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Calendar</h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'parent' 
              ? 'School events and your child\'s learning milestones'
              : 'School events, learning focus, and important dates'
            }
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => setCreateEventModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="ghost" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={viewFilter}
                onChange={(e) => setViewFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Events</option>
                <option value="school_event">School Events</option>
                <option value="learning_focus">Learning Focus</option>
                {user?.role === 'parent' && <option value="milestone">Milestones</option>}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="h-24 p-1"></div>
            ))}
            
            {days.map((date) => {
              const dayEvents = getEventsForDate(date);
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), date).toDateString();
              
              return (
                <motion.div
                  key={date}
                  whileHover={{ scale: 1.02 }}
                  className={`h-24 p-1 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 ${
                    isToday ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {date}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEvents
              .filter(event => new Date(event.start_time) >= new Date())
              .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
              .slice(0, 5)
              .map((event) => (
                <div key={event.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${event.color.split(' ')[0]}`}></div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(event.start_time).toLocaleDateString()} at {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${event.color}`}>
                    {event.type.replace('_', ' ')}
                  </span>
                </div>
              ))}
            
            {filteredEvents.filter(event => new Date(event.start_time) >= new Date()).length === 0 && (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming events scheduled.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={createEventModalOpen}
        onClose={() => setCreateEventModalOpen(false)}
        selectedDate={selectedDate}
        onSuccess={handleCreateEventSuccess}
      />
    </div>
  );
};