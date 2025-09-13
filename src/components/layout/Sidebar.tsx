// src/components/layout/Sidebar.tsx (Corrected Version)

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Settings, 
  DollarSign, 
  FileCheck, // The duplicate has been removed
  Store,
  Brain,
  Home,
  Heart,
  LogOut,
  TreePine
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// NOTE: The 'useModuleStatus' hook is not needed here as we can get the modules directly from the user object in useAuth.

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  roles: string[];
  moduleRequired?: string;
}

const navigationItems: NavItem[] = [
  // Dashboard - All roles
  { path: '/dashboard', icon: Home, label: 'Dashboard', roles: ['admin', 'teacher', 'parent'] },
  
  // Admin-specific items
  { path: '/admin/students', icon: Users, label: 'Students', roles: ['admin'] },
  { path: '/admin/teachers', icon: Users, label: 'Teachers', roles: ['admin'] },
  { path: '/admin/compliance', icon: FileCheck, label: 'Compliance Hub', roles: ['admin'] },
  { path: '/admin/modules', icon: Store, label: 'Modules Marketplace', roles: ['admin'] },
  
  // Premium Admin modules
  { path: '/admin/financials', icon: DollarSign, label: 'Financials', roles: ['admin'], moduleRequired: 'FINANCIALS' },
  { path: '/admin/co-pilot', icon: Brain, label: 'AI Co-Pilot', roles: ['admin'], moduleRequired: 'AI_COPILOT' },
  
  // Teacher-specific items  
  { path: '/teacher/planner', icon: BookOpen, label: 'Curriculum Planner', roles: ['teacher'] },
  
  // Parent-specific items
  { path: '/parent/connection', icon: Heart, label: 'Connection Hub', roles: ['parent'] },
  
  // Shared items
  { path: '/calendar', icon: Calendar, label: 'Calendar', roles: ['admin', 'teacher', 'parent'] },
  { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'teacher', 'parent'] },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredItems = navigationItems.filter(item => {
    if (!user) return false;
    
    // Check if user's role is allowed
    if (!item.roles.includes(user.role)) return false;
    
    // Check if module is required and user has it
    if (item.moduleRequired) {
      // Safely check the unlocked_modules array from the user object
      return user.unlocked_modules?.includes(item.moduleRequired) || false;
    }
    
    return true;
  });

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Logo and School Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
            <TreePine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Mom's Grove</h1>
            <p className="text-sm text-gray-500 capitalize">{user?.role} Portal</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {user?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                <span className="flex-1">{item.label}</span>
                {item.moduleRequired && (
                  <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-md font-medium">
                    Pro
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </div>
  );
};