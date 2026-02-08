import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Trophy, PlusCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isAdmin } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'Create New', href: '/tournaments/new', icon: PlusCircle, adminOnly: true },
  ];

  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
              C
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">CricScheduler</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-50 text-primary-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )
              }
            >
              <item.icon className={cn("w-5 h-5", "flex-shrink-0")} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">AI Scheduler</p>
              <p className="text-[10px] text-gray-500">Pro Feature Active</p>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 w-full animate-pulse" />
          </div>
        </div>
      </aside>
    </>
  );
}
