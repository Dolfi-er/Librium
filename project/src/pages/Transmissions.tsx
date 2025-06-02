import { useState, useEffect } from 'react';
import { 
  Search, Plus, Filter, ChevronLeft, ChevronRight, 
  BookCopy, Trash, CheckCircle, X, AlertTriangle,
  Calendar, User, BookOpen, Clock
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

interface Status {
  id: number;
  statusName: string;
}

interface Transmission {
  bookId: number;
  userId: number;
  issuanceDate: string;
  dueDate: string;
  statusId: number;
  bookTitle: string;
  userLogin: string;
  statusName: string;
}

interface Book {
  id: number;
  title: string;
}

interface User {
  id: number;
  login: string;
}

const TRANSMISSION_STATUSES = {
  ISSUED: 1,      // Выдана
  RETURNED: 2,    // Возвращена
  OVERDUE: 3      // Задержана
};

const Transmissions = () => {
  const location = useLocation();
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [filteredTransmissions, setFilteredTransmissions] = useState<Transmission[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const itemsPerPage = 10;

  const [issueForm, setIssueForm] = useState({
    bookId: '',
    userId: '',
    issuanceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTransmissionsAndStatuses();
  }, []);

  const fetchTransmissionsAndStatuses = async () => {
    setIsLoading(true);
    try {
      const [transmissionsResponse, statusesResponse] = await Promise.all([
        api.get('/api/Transmission'),
        api.get('/api/Status')
      ]);
      setTransmissions(transmissionsResponse.data);
      setFilteredTransmissions(transmissionsResponse.data);
      setStatuses(statusesResponse.data);

      const params = new URLSearchParams(location.search);
      if (params.get('filter') === 'Задержана') {
        setShowOverdueOnly(true);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      toast.error('Не удалось загрузить записи книговыдачи');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBooksAndUsers = async () => {
    try {
      setIsLoadingBooks(true);
      setIsLoadingUsers(true);
      
      const [booksResponse, usersResponse] = await Promise.all([
        api.get('/api/Books'),
        api.get('/api/User')
      ]);
      
      setBooks(booksResponse.data.map((book: any) => ({
        id: book.id,
        title: book.title || 'Без названия'
      })));
      
      setUsers(usersResponse.data.map((user: any) => ({
        id: user.id,
        login: user.login || 'Без логина'
      })));
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      toast.error('Не удалось загрузить данные для выдачи');
    } finally {
      setIsLoadingBooks(false);
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (showForm) {
      fetchBooksAndUsers();
    }
  }, [showForm]);

  const handleDeleteTransmission = async (bookId: number, userId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись книговыдачи?')) {
      return;
    }

    try {
      await api.delete(`/api/Transmission/${bookId}/${userId}`);
      toast.success('Запись книговыдачи удалена');
      fetchTransmissionsAndStatuses();
    } catch (error) {
      console.error('Ошибка удаления записи:', error);
      toast.error('Не удалось удалить запись книговыдачи');
    }
  };

  const handleMarkAsReturned = async (transmission: Transmission) => {
    try {
      const returnedStatus = statuses.find(s => s.id === TRANSMISSION_STATUSES.RETURNED);
      if (!returnedStatus) {
        throw new Error('Статус "Возвращена" не найден');
      }

      await api.put(`/api/Transmission/${transmission.bookId}/${transmission.userId}`, {
        statusId: returnedStatus.id
      });

      toast.success('Книга отмечена как возвращенная');
      fetchTransmissionsAndStatuses();
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      toast.error('Не удалось отметить книгу как возвращенную');
    }
  };

  const handleIssueSubmit = async () => {
    if (!issueForm.bookId || !issueForm.userId) {
      toast.error('Выберите книгу и пользователя');
      return;
    }

    try {
      const issuedStatus = statuses.find(s => s.id === TRANSMISSION_STATUSES.ISSUED);
      if (!issuedStatus) {
        throw new Error('Статус "Выдана" не найден');
      }

      const issueData = {
        bookId: parseInt(issueForm.bookId),
        userId: parseInt(issueForm.userId),
        issuanceDate: `${issueForm.issuanceDate}T00:00:00Z`,
        dueDate: `${issueForm.dueDate}T00:00:00Z`,
        statusId: issuedStatus.id
      };

      await api.post('/api/Transmission', issueData);
      
      toast.success('Книга успешно выдана');
      setShowForm(false);
      setIssueForm({
        bookId: '',
        userId: '',
        issuanceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0]
      });
      fetchTransmissionsAndStatuses();
    } catch (error) {
      console.error('Ошибка выдачи книги:', error);
      toast.error('Не удалось выдать книгу');
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...transmissions];
    
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(transmission => 
        transmission.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transmission.userLogin.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== null) {
      filtered = filtered.filter(transmission => transmission.statusId === statusFilter);
    }
    
    if (showOverdueOnly) {
      filtered = filtered.filter(transmission => transmission.statusId === TRANSMISSION_STATUSES.OVERDUE);
    }
    
    setFilteredTransmissions(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, showOverdueOnly, transmissions]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransmissions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransmissions.slice(indexOfFirstItem, indexOfLastItem);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
    setShowOverdueOnly(false);
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-gray-900">Книговыдача</h1>
          <p className="text-gray-600 mt-1">Управление записями книговыдачи и возвратами</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-md mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" /> Выдать книгу
        </button>
      </div>

      <div className="card mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию или пользователю..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <select
              value={statusFilter === null ? '' : statusFilter}
              onChange={(e) => setStatusFilter(e.target.value ? Number(e.target.value) : null)}
              className="input"
            >
              <option value="">Все статусы</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.statusName}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              className={`btn btn-md ${showOverdueOnly ? 'btn-accent' : 'btn-ghost border border-gray-200'}`}
            >
              <AlertTriangle className={`mr-2 h-4 w-4 ${showOverdueOnly ? 'text-white' : 'text-red-500'}`} /> 
              Только задержанные
            </button>
            
            {(searchTerm || statusFilter !== null || showOverdueOnly) && (
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
            {filteredTransmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <BookCopy className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Записи книговыдачи не найдены</h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm.trim() !== '' || statusFilter !== null || showOverdueOnly
                    ? "Ни одна запись книговыдачи не соответствует запросу"
                    : "Отсутствуют записи книговыдачи."}
                </p>
                {(searchTerm.trim() !== '' || statusFilter !== null || showOverdueOnly) && (
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
                    <th>Книга</th>
                    <th>Пользователь</th>
                    <th className="hidden sm:table-cell">Дата выдачи</th>
                    <th>Дата возврата</th>
                    <th>Статус</th>
                    <th>Управление</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((transmission, idx) => (
                    <tr key={idx}>
                      <td className="font-medium max-w-[180px] truncate">{transmission.bookTitle}</td>
                      <td>{transmission.userLogin}</td>
                      <td className="hidden sm:table-cell">{new Date(transmission.issuanceDate).toLocaleDateString()}</td>
                      <td>{new Date(transmission.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transmission.statusId === TRANSMISSION_STATUSES.ISSUED
                            ? 'bg-blue-100 text-blue-800' 
                            : transmission.statusId === TRANSMISSION_STATUSES.RETURNED
                              ? 'bg-green-100 text-green-800'
                              : transmission.statusId === TRANSMISSION_STATUSES.OVERDUE
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                          {transmission.statusId === TRANSMISSION_STATUSES.OVERDUE && (
                            <AlertTriangle className="mr-1 h-3 w-3" />
                          )}
                          {transmission.statusId === TRANSMISSION_STATUSES.RETURNED && (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}
                          {transmission.statusName}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          {(transmission.statusId === TRANSMISSION_STATUSES.ISSUED || transmission.statusId === TRANSMISSION_STATUSES.OVERDUE)&& (
                            <button
                              onClick={() => handleMarkAsReturned(transmission)}
                              title="Отметить как возвращенную"
                              className="btn btn-ghost btn-sm p-1"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTransmission(transmission.bookId, transmission.userId)}
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
          {filteredTransmissions.length > 0 && (
            <div className="flex items-center justify-between my-6">
              <div className="text-sm text-gray-600">
                Показывается {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransmissions.length)} из {filteredTransmissions.length} записей
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

      {/* Issue Book Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Выдать книгу</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="book" className="block text-sm font-medium text-gray-700 mb-1">
                  Книга
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select 
                    id="book"
                    value={issueForm.bookId}
                    onChange={(e) => setIssueForm({...issueForm, bookId: e.target.value})}
                    className="input pl-9"
                    disabled={isLoadingBooks}
                  >
                    <option value="">Выберите книгу</option>
                    {isLoadingBooks ? (
                      <option>Загрузка книг...</option>
                    ) : (
                      books.map(book => (
                        <option key={book.id} value={book.id}>
                          {book.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
                  Пользователь
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select 
                    id="user"
                    value={issueForm.userId}
                    onChange={(e) => setIssueForm({...issueForm, userId: e.target.value})}
                    className="input pl-9"
                    disabled={isLoadingUsers}
                  >
                    <option value="">Выберите пользователя</option>
                    {isLoadingUsers ? (
                      <option>Загрузка пользователей...</option>
                    ) : (
                      users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.login}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Дата выдачи
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="issueDate"
                    type="date"
                    value={issueForm.issuanceDate}
                    onChange={(e) => setIssueForm({...issueForm, issuanceDate: e.target.value})}
                    className="input pl-9"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Дата возврата
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="dueDate"
                    type="date"
                    value={issueForm.dueDate}
                    onChange={(e) => setIssueForm({...issueForm, dueDate: e.target.value})}
                    className="input pl-9"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-ghost btn-md border border-gray-200"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleIssueSubmit}
                  className="btn btn-primary btn-md"
                  disabled={isLoadingBooks || isLoadingUsers}
                >
                  Выдать книгу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transmissions;