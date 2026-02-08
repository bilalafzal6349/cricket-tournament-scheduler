import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
          Manage Tournaments
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-gray-600">{user.email}</span>
            {isAdmin && (
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                Admin
              </span>
            )}
          </div>
        )}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full border-2 border-white"></span>
        </button>
        {user && (
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 border-2 border-white shadow-sm ring-2 ring-gray-100" />
      </div>
    </header>
  );
}
