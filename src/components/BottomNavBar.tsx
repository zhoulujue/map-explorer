import { } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export default function BottomNavBar() {
  const location = useLocation();
  const { isDark } = useTheme();
  
  // 根据设计图创建导航项
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: '首页',
      icon: '🏠',
      path: '/'
    },
    {
      id: 'favorites',
      label: '收藏',
      icon: '❤️',
      path: '/favorites'
    },
    {
      id: 'settings',
      label: '设置',
      icon: '⚙️',
      path: '/settings'
    }
  ];

  // 确定当前路径是否应该显示导航栏
  const shouldShowNavbar = !location.pathname.startsWith('/place/') && 
                         !location.pathname.startsWith('/login') &&
                         !location.pathname.startsWith('/register');

  if (!shouldShowNavbar) {
    return null;
  }

  return (
    <motion.nav
      className={`fixed bottom-0 left-0 right-0 z-50 px-4 py-2 ${isDark ? 'bg-gray-900 shadow-[0_-1px_3px_rgba(0,0,0,0.3)] border-t border-gray-800' : 'bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.1)] border-t border-gray-200'}`}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => (
              `flex flex-col items-center justify-center space-y-1 w-20 px-2 py-2 rounded-xl transition-colors ${isDark 
                ? isActive ? 'text-blue-400 bg-gray-800' : 'text-gray-400 hover:bg-gray-800'
                : isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'
              }`
            )}
          >
            <motion.span 
              className="text-xl"
              initial={{ scale: 1 }}
              animate={{ scale: location.pathname === item.path ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {item.icon}
            </motion.span>
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
}
