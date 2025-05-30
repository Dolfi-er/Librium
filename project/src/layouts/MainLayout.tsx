import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, LampDesk, Users, BookCopy, User, LayoutDashboard, 
  LogOut, Menu, X, BookMarked, ChevronDown 
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  
  // Навигация с указанием разрешенных ролей
  const navigation = [
    { name: 'Дэшборд', href: '/', icon: LayoutDashboard, roles: ['Админ', 'Библиотекарь'] },
    { name: 'Книги', href: '/books', icon: BookOpen, roles: ['Админ', 'Библиотекарь'] },
    { name: 'Авторы', href: '/authors', icon: BookMarked, roles: ['Админ', 'Библиотекарь'] },
    { name: 'Пользователи', href: '/users', icon: User, roles: ['Админ'] },
    { name: 'Книговыдача', href: '/transmissions', icon: BookCopy, roles: ['Админ', 'Библиотекарь'] },
    { name: 'Залы', href: '/halls', icon: LampDesk, roles: ['Админ', 'Библиотекарь'] },
  ];

  // Фильтрация меню по роли пользователя
  const filteredNavigation = navigation.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  // Проверка доступа к текущему маршруту
  useEffect(() => {
    if (!user) return;

    // Находим текущий маршрут в навигации
    const currentRoute = navigation.find(route => {
      if (route.href === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(route.href);
    });

    // Если маршрут требует определенной роли, проверяем доступ
    if (currentRoute && !currentRoute.roles.includes(user.role)) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, user, navigate]);

  // Автоматическое открытие/закрытие сайдбара на мобильных устройствах
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    
    handleResize(); // Установка начального состояния
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Закрытие сайдбара при смене маршрута на мобильных
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Мобильный бэкдроп для сайдбара */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Сайдбар */}
      <aside 
        className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-white shadow-lg border-r transition-transform duration-300 ease-in-out 
                  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-semibold">Librium</span>
          </Link>
          <button 
            className="lg:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex flex-col gap-1 px-2 py-4">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium 
                ${location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href))
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Основной контент */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Верхняя навигационная панель */}
        <header className="bg-white shadow-sm border-b z-10">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              className="rounded-md p-2 text-gray-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center ml-auto">
              <div className="relative ml-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      className="flex max-w-xs items-center rounded-md bg-gray-100 px-3 py-2 text-sm"
                    >
                      <span className="text-gray-700">
                        {user?.role || "Гость"}
                      </span>
                      <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  
                  <button
                    onClick={logout}
                    className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Контент страницы */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;