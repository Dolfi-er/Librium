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

interface UserFormData {
  login: string;
  password: string;
  roleId: number;
  fio: string;
  phone: string;
  ticketNumber?: string;
  birthday?: string;
  education?: string;
  hallId?: number;
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
  const [formData, setFormData] = useState<UserFormData>({
    login: '',
    password: '',
    roleId: 1,
    fio: '',
    phone: '',
  });
  const [halls, setHalls] = useState<any[]>([]);
  const itemsPerPage = 10;

  useEffect(() => {
    Promise.all([
      fetchUsersAndRoles(),
      fetchHalls()
    ]);
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
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHalls = async () => {
    try {
      const response = await api.get('/api/Hall');
      setHalls(response.data);
    } catch (error) {
      console.error('Error fetching halls:', error);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await api.delete(`/api/User/${id}`);
      toast.success('User deleted successfully');
      fetchUsersAndRoles(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/api/User/${editingUser.id}`, formData);
        toast.success('User updated successfully');
      } else {
        await api.post('/api/User', formData);
        toast.success('User added successfully');
      }
      
      setShowUserForm(false);
      setEditingUser(null);
      setFormData({
        login: '',
        password: '',
        roleId: 1,
        fio: '',
        phone: '',
      });
      fetchUsersAndRoles();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
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
          <h1 className="font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage library users and staff</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowUserForm(true);
          }}
          className="btn btn-primary btn-md mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" /> Add User
        </button>
      </div>

      <div className="card mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, login, or phone..."
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
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            
            {(searchTerm || roleFilter !== null) && (
              <button 
                onClick={clearFilters}
                className="btn btn-ghost btn-md border border-gray-200"
              >
                <X className="mr-2 h-4 w-4" /> Clear Filters
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
                <h3 className="text-lg font-medium text-gray-700">No users found</h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm.trim() !== '' || roleFilter !== null
                    ? "No users match your search criteria"
                    : "Your user list is empty. Add users to get started."}
                </p>
                {(searchTerm.trim() !== '' || roleFilter !== null) && (
                  <button
                    onClick={clearFilters}
                    className="btn btn-ghost btn-sm mt-4 text-blue-600"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Login</th>
                    <th className="hidden md:table-cell">Phone</th>
                    <th>Role</th>
                    <th className="hidden sm:table-cell">Ticket #</th>
                    <th>Actions</th>
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
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
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
                  Page {currentPage} of {totalPages}
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

      {/* Add/Edit User Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => {
                  setShowUserForm(false);
                  setEditingUser(null);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-1">
                    Login
                  </label>
                  <input
                    id="login"
                    name="login"
                    type="text"
                    value={formData.login}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input"
                    required={!editingUser}
                  />
                </div>
                
                <div>
                  <label htmlFor="fio" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="fio"
                    name="fio"
                    type="text"
                    value={formData.fio}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="roleId"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="hallId" className="block text-sm font-medium text-gray-700 mb-1">
                    Hall
                  </label>
                  <select
                    id="hallId"
                    name="hallId"
                    value={formData.hallId || ''}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="">Select a hall</option>
                    {halls.map(hall => (
                      <option key={hall.id} value={hall.id}>
                        {hall.hallName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="ticketNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Ticket Number
                  </label>
                  <input
                    id="ticketNumber"
                    name="ticketNumber"
                    type="text"
                    value={formData.ticketNumber || ''}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
                    Birthday
                  </label>
                  <input
                    id="birthday"
                    name="birthday"
                    type="date"
                    value={formData.birthday || ''}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                    Education
                  </label>
                  <input
                    id="education"
                    name="education"
                    type="text"
                    value={formData.education || ''}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                  }}
                  className="btn btn-ghost btn-md border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-md"
                >
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;