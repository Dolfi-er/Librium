import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Users, BookCopy, TrendingUp, AlertTriangle, 
  Clock, BookMarked, CheckCircle 
} from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalAuthors: 0,
    totalUsers: 0,
    totalTransmissions: 0,
    overdueBooks: 0
  });
  
  const [recentTransmissions, setRecentTransmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be a single API endpoint or multiple concurrent requests
        // For demo purposes, we're using mock data
        
        // Simulate API call
        setTimeout(() => {
          setStats({
            totalBooks: 1287,
            totalAuthors: 342,
            totalUsers: 156,
            totalTransmissions: 2341,
            overdueBooks: 17
          });
          
          setRecentTransmissions([
            { id: 1, bookTitle: 'The Great Gatsby', userLogin: 'john.doe', dueDate: '2025-07-20', statusName: 'Active' },
            { id: 2, bookTitle: 'To Kill a Mockingbird', userLogin: 'jane.smith', dueDate: '2025-07-15', statusName: 'Overdue' },
            { id: 3, bookTitle: '1984', userLogin: 'robert.johnson', dueDate: '2025-07-22', statusName: 'Active' },
            { id: 4, bookTitle: 'The Hobbit', userLogin: 'mary.williams', dueDate: '2025-07-18', statusName: 'Active' },
            { id: 5, bookTitle: 'Pride and Prejudice', userLogin: 'david.brown', dueDate: '2025-07-12', statusName: 'Overdue' }
          ]);
          
          setIsLoading(false);
        }, 500);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
        <h1 className="font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Library management system overview</p>
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
          <StatCard title="Total Books" value={stats.totalBooks} icon={BookOpen} color="bg-blue-500" />
          <StatCard title="Total Authors" value={stats.totalAuthors} icon={BookMarked} color="bg-teal-500" />
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-indigo-500" />
          <StatCard title="Overdue Books" value={stats.overdueBooks} icon={AlertTriangle} color="bg-red-500" />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transmissions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Recent Book Transmissions</h2>
            <Link to="/transmissions" className="text-sm text-blue-600 hover:text-blue-800">
              View all
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
                    <th>Book</th>
                    <th>User</th>
                    <th>Due Date</th>
                    <th>Status</th>
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
                          transmission.statusName === 'Overdue' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {transmission.statusName === 'Overdue' ? (
                            <AlertTriangle className="mr-1 h-3 w-3" />
                          ) : (
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
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="card p-4 flex flex-col gap-3">
            <Link 
              to="/books" 
              className="btn btn-primary btn-md justify-start"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Browse Books
            </Link>
            
            <Link 
              to="/transmissions" 
              className="btn btn-secondary btn-md justify-start"
            >
              <BookCopy className="mr-2 h-5 w-5" />
              Issue/Return Book
            </Link>
            
            <Link 
              to="/users" 
              className="btn btn-accent btn-md justify-start"
            >
              <Users className="mr-2 h-5 w-5" />
              Manage Users
            </Link>
            
            <Link 
              to="/transmissions?filter=overdue" 
              className="btn btn-ghost btn-md justify-start border border-gray-200"
            >
              <Clock className="mr-2 h-5 w-5 text-red-500" />
              Check Overdue Books
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;