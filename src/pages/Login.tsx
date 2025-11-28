import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService, isSupabaseConfigured } from '@/services/supabase';
import { useStore } from '@/store';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Sign in
        const result = await supabaseService.signIn(email, password);
        if (result.user) {
          setUser({
            id: result.user.id,
            email: result.user.email || '',
            name: result.user.user_metadata?.name || 'User',
            created_at: result.user.created_at,
            last_login: new Date().toISOString(),
          });
          navigate('/');
        }
      } else {
        // Sign up
        if (!name.trim()) {
          setError('请输入姓名');
          return;
        }
        
        const result = await supabaseService.signUp(email, password, name);
        if (result.user) {
          setUser({
            id: result.user.id,
            email: result.user.email || '',
            name: result.user.user_metadata?.name || name,
            created_at: result.user.created_at,
            last_login: new Date().toISOString(),
          });
          navigate('/');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || '操作失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      {/* Logo and Title */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl font-bold text-white">🗺️</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">地图探索</h1>
        <p className="text-gray-600">发现身边的好去处</p>
      </motion.div>
      
      <div className="w-full max-w-md">
        <motion.div 
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? '欢迎回来' : '创建账户'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? '登录以管理您的收藏' : '开始您的探索之旅'}
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-3 mb-4">
              未配置 Supabase，登录与收藏功能暂不可用。
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  姓名
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入您的姓名"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="请输入邮箱地址"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                  placeholder="请输入密码"
                  required
                  minLength={6}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading || !isSupabaseConfigured}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text白 py-3 px-4 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg disabled:shadow-none"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>处理中...</span>
                </div>
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
              {isLogin ? '没有账户？立即注册' : '已有账户？立即登录'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              继续以游客身份浏览
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
