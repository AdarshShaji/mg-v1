import { useAuth } from '../context/AuthContext';

export const useModuleStatus = (moduleId: string): boolean => {
  const { user } = useAuth();
  return user?.unlocked_modules?.includes(moduleId) ?? false;
};