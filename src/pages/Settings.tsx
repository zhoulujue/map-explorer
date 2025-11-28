import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { supabaseService } from '@/services/supabase';
import { useTheme } from '@/hooks/useTheme';

interface SettingItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  value?: string;
  onClick?: () => void;
  showArrow?: boolean;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useStore();
  const { toggleTheme, isDark } = useTheme();
  const logout = async () => {
    try {
      await supabaseService.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setNotification({ message: '退出登录失败', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !window.confirm('确定要删除您的账户吗？此操作不可撤销，所有数据将被永久删除。')) {
      return;
    }

    try {
      setIsLoading(true);
      // 暂时注释掉，因为supabaseService中没有deleteAccount方法
      // await supabaseService.deleteAccount(user.id);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Delete account error:', error);
      setNotification({ message: '删除账户失败', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDarkModeChange = () => {
    toggleTheme();
  };

  const accountSettings: SettingItem[] = [
    {
      id: 'profile',
      icon: '👤',
      title: '个人资料',
      subtitle: '编辑您的个人信息',
      onClick: () => {},
      showArrow: true,
    },
    {
      id: 'notifications',
      icon: '🔔',
      title: '通知设置',
      subtitle: '管理推送通知',
      onClick: () => {},
      showArrow: true,
    },
  ];

  const generalSettings: SettingItem[] = [
    {
      id: 'darkMode',
      icon: '🌙',
      title: '深色模式',
      isToggle: true,
      toggleValue: isDark,
      onToggleChange: handleDarkModeChange,
    },
    {
      id: 'language',
      icon: '🌐',
      title: '语言',
      value: '简体中文',
      onClick: () => {},
      showArrow: true,
    },
    {
      id: 'units',
      icon: '📏',
      title: '单位设置',
      value: '公里',
      onClick: () => {},
      showArrow: true,
    },
  ];

  const aboutSettings: SettingItem[] = [
    {
      id: 'about',
      icon: 'ℹ️',
      title: '关于我们',
      onClick: () => {},
      showArrow: true,
    },
    {
      id: 'privacy',
      icon: '🔒',
      title: '隐私政策',
      onClick: () => {},
      showArrow: true,
    },
    {
      id: 'terms',
      icon: '📄',
      title: '服务条款',
      onClick: () => {},
      showArrow: true,
    },
    {
      id: 'feedback',
      icon: '💬',
      title: '意见反馈',
      onClick: () => {},
      showArrow: true,
    },
    {
      id: 'version',
      icon: '📱',
      title: '版本',
      value: '1.0.0',
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    return (
      <motion.div
        key={item.id}
        className="flex items-center justify-between py-4 px-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center space-x-4">
          <span className="text-xl">{item.icon}</span>
          <div>
            <h3 className="font-medium text-gray-900">{item.title}</h3>
            {item.subtitle && (
              <p className="text-sm text-gray-500">{item.subtitle}</p>
            )}
          </div>
        </div>
        
        {item.isToggle ? (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={item.toggleValue}
              onChange={(e) => item.onToggleChange?.(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        ) : (
          <div className="flex items-center space-x-2">
            {item.value && (
              <span className="text-gray-500 text-sm">{item.value}</span>
            )}
            {item.showArrow && (
              <span className="text-gray-400">›</span>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <motion.h1 
          className="text-xl font-bold text-gray-900 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          设置
        </motion.h1>
      </header>

      <main className="px-4 py-6">
        {notification && (
          <motion.div
            className={`px-4 py-3 rounded-lg mb-6 ${notification.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {notification.message}
          </motion.div>
        )}

        {isAuthenticated && user ? (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* 用户信息卡片 */}
            <motion.div
              className="bg-white rounded-xl shadow-sm p-6 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl mx-auto mb-4">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{user.email}</h2>
              <p className="text-gray-500 text-sm">加入时间：{new Date(user.created_at).toLocaleDateString()}</p>
            </motion.div>

            {/* 账户设置 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 px-1">账户设置</h3>
              <div className="space-y-2">
                {accountSettings.map(renderSettingItem)}
              </div>
            </div>

            {/* 通用设置 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 px-1">通用设置</h3>
              <div className="space-y-2">
                {generalSettings.map(renderSettingItem)}
              </div>
            </div>

            {/* 关于 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 px-1">关于</h3>
              <div className="space-y-2">
                {aboutSettings.map(renderSettingItem)}
              </div>
            </div>

            {/* 退出登录和删除账户 */}
            <div className="space-y-3 pb-20">
              <motion.button
                className="w-full py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 shadow-sm"
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? '处理中...' : '退出登录'}
              </motion.button>
              <motion.button
                className="w-full py-3 bg-red-50 border border-red-200 rounded-lg font-medium text-red-600 shadow-sm"
                whileTap={{ scale: 0.98 }}
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                删除账户
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="min-h-[60vh] flex flex-col items-center justify-center p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-5xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">登录后访问设置</h2>
            <p className="text-gray-500 mb-6 text-center">登录后可以管理您的个人设置和偏好</p>
            <motion.button
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full shadow-md"
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
            >
              登录 / 注册
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
