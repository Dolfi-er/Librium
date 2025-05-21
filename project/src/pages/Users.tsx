import { useState, useEffect } from 'react';
import { 
  Search, Plus, ChevronLeft, ChevronRight, 
  Users as UsersIcon, Trash, PenSquare, X,
  Filter, UserCircle
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  login: string;
  role: Role;
  info: {
    fio: string;
    phone: string;
    ticketNumber: string | null;
    birthday: string | null;
    education: string | null;
    hallId: number | null;
  };
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<number | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        api.get('/api/User'),
        api.get('/api/Role')
      ]);
      setUsers(usersResponse.data);
      setFilteredUsers(usersResponse.data);
      setRoles(rolesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Не удалось загрузить пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      await api.delete(`/api/User/${id}`);
      toast.success('Пользователь удален');
      fetchUsersAndRoles(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Не удалось удалить пользователя');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(user => 
        user.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.info.fio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.info.phone.includes(searchTerm)
      );
    }
    
    // Apply role filter
    if (roleFilter !== null) {
      filtered = filtered.filter(user => user.role.id === roleFilter);
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, roleFilter, users]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter(null);
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-gray-900">Пользователи</h1>
          <p className="text-gray-600 mt-1">Управление пользователями в вашей библиотеке</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowUserForm(true);
          }}
          className="btn btn-primary btn-md mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" /> Добавить пользователя
        </button>
      </div>

      <div className="card mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по имени, логину или телефону..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <select
              value={roleFilter === null ? '' : roleFilter}
              onChange={(e) => setRoleFilter(e.target.value ? Number(e.target.value) : null)}
              className="input"
            >
              <option value="">Все роли</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            
            {(searchTerm || roleFilter !== null) && (
              <button 
                onClick={clearFilters}
                className="btn btn-ghost btn-md border border-gray-200"
              >
                <X className="mr-2 h-4 w-4" /> Очистить фильтры
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="table-container animate-pulse">
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="table-container">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <UserCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Пользователи не найдены</h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm.trim() !== '' || roleFilter !== null
                    ? "Ни один пользователь не соответствует запросу"
                    : "Ваш список пользователей пуст. Добавьте пользователей, чтобы начать."}
                </p>
                {(searchTerm.trim() !== '' || roleFilter !== null) && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-ghost btn-sm mt-4 text-blue-600"
                  >
                    Очистить фильтры
                  </button>
                )}
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Логин</th>
                    <th className="hidden md:table-cell">Телефон</th>
                    <th>Роль</th>
                    <th className="hidden sm:table-cell">№ билета</th>
                    <th>Управление</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((user) => (
                    <tr key={user.id}>
                      <td className="font-medium">{user.info.fio}</td>
                      <td>{user.login}</td>
                      <td className="hidden md:table-cell">{user.info.phone}</td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role.name === 'Admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : user.role.name === 'Librarian'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role.name}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell">{user.info.ticketNumber || 'N/A'}</td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="btn btn-ghost btn-sm p-1"
                          >
                            <PenSquare className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="btn btn-ghost btn-sm p-1"
                          >
                            <Trash className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between my-6">
              <div className="text-sm text-gray-600">
                Показывается {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} из {filteredUsers.length} по
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-ghost btn-sm p-1 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="text-sm font-medium">
                  Страница {currentPage} из {totalPages}
                </div>
                
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn btn-ghost btn-sm p-1 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Users;