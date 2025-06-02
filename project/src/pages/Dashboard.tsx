import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Users, BookCopy, AlertTriangle, 
  Clock, BookMarked, CheckCircle 
} from 'lucide-react';
import api from '../services/api';

const TRANSMISSION_STATUSES = {
  ISSUED: 1,      // Выдана
  RETURNED: 2,    // Возвращена
  OVERDUE: 3      // Задержана
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalAuthors: 0,
    totalUsers: 0,
    totalTransmissions: 0,
    overdueBooks: 0
  });
  
  const [recentTransmissions, setRecentTransmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Получение статистики
        const statsResponse = await api.get('/api/Dashboard/stats');
        setStats(statsResponse.data);

        // Получение последних выдач
        const transmissionsResponse = await api.get('/api/Transmission/recent');
        setRecentTransmissions(transmissionsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) => (
    <div className="card p-6 flex items-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="font-bold text-gray-900">Дэшборд</h1>
        <p className="text-gray-600 mt-1">Обзор состояния вашей библиотеки</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 flex items-center animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200"></div>
              <div className="ml-4 w-full">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Всего книг" value={stats.totalBooks} icon={BookOpen} color="bg-blue-500" />
          <StatCard title="Всего авторов" value={stats.totalAuthors} icon={BookMarked} color="bg-teal-500" />
          <StatCard title="Всего пользователей" value={stats.totalUsers} icon={Users} color="bg-indigo-500" />
          <StatCard title="Задержанных книг" value={stats.overdueBooks} icon={AlertTriangle} color="bg-red-500" />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transmissions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Недавно выданные книги</h2>
            <Link to="/transmissions" className="text-sm text-blue-600 hover:text-blue-800">
              Посмотреть все
            </Link>
          </div>
          
          {isLoading ? (
            <div className="table-container animate-pulse">
              <div className="p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="py-3 flex">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Книга</th>
                    <th>Пользователь</th>
                    <th>Дата возврата</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransmissions.map((transmission: any) => (
                    <tr key={transmission.id}>
                      <td className="max-w-[200px] truncate">{transmission.bookTitle}</td>
                      <td>{transmission.userLogin}</td>
                      <td>{new Date(transmission.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transmission.statusName === 'Выдана'
                            ? 'bg-blue-100 text-blue-800' 
                            : transmission.statusName === 'Возвращена'
                              ? 'bg-green-100 text-green-800'
                              : transmission.statusName === 'Задержана'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                          {transmission.statusName === 'Задержана' && (
                            <AlertTriangle className="mr-1 h-3 w-3" />
                          )}
                          {transmission.statusName === 'Возвращена' && (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}
                          {transmission.statusName}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-medium mb-4">Быстрые действия</h2>
          <div className="card p-4 flex flex-col gap-3">
            <Link 
              to="/books" 
              className="btn btn-primary btn-md justify-start"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Просмотр книг
            </Link>
            
            <Link 
              to="/transmissions" 
              className="btn btn-secondary btn-md justify-start"
            >
              <BookCopy className="mr-2 h-5 w-5" />
              Выдать/Вернуть книгу
            </Link>
            
            <Link 
              to="/users" 
              className="btn btn-accent btn-md justify-start"
            >
              <Users className="mr-2 h-5 w-5" />
              Управление пользователями
            </Link>
            
            <Link 
              to="/transmissions?filter=overdue" 
              className="btn btn-ghost btn-md justify-start border border-gray-200"
            >
              <Clock className="mr-2 h-5 w-5 text-red-500" />
              Проверить задержанные книги
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;