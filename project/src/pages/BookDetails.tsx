import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, BookOpen, Star, Calendar, Bookmark, 
  Hash, Package, Users, Trash, Clock, AlertTriangle, CheckCircle
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const TRANSMISSION_STATUSES = {
  ISSUED: 1,      // Выдана
  RETURNED: 2,    // Возвращена
  OVERDUE: 3      // Задержана
};

interface Author {
  id: number;
  authorName: string;
}

interface Book {
  id: number;
  title: string;
  isbn: string;
  publishDate: string | null;
  addmissionDate: string;
  quantity: number;
  rating: number;
  authorIds: number[];
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

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    isbn: '',
    publishDate: null,
    quantity: 1,
    rating: 0,
    authorIds: []
  });

  useEffect(() => {
    const fetchBookDetails = async () => {
      setIsLoading(true);
      try {
        const [bookResponse, authorsResponse, transmissionsResponse] = await Promise.all([
          api.get(`/api/Books/${id}`),
          api.get('/api/Authors'),
          api.get(`/api/Transmission/book/${id}`)
        ]);
        
        setBook(bookResponse.data);
        setFormData(bookResponse.data);
        setAuthors(authorsResponse.data);
        setTransmissions(transmissionsResponse.data);
      } catch (error) {
        console.error('Error fetching book details:', error);
        toast.error('Failed to load book details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
    setFormData({
      ...formData,
      authorIds: selectedOptions
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Отправляем запрос на обновление книги через API
      await api.put(`/api/Books/${id}`, formData);
      
      // Получаем обновленные данные книги с сервера
      const bookResponse = await api.get(`/api/Books/${id}`);
      const updatedBook = bookResponse.data;
      
      // Обновляем состояние
      setBook(updatedBook);
      setFormData(updatedBook);
      
      toast.success('Книга успешно обновлена');
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при обновлении книги:', error);
      toast.error('Не удалось обновить книгу');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту книгу?')) {
      return;
    }

    try {
      await api.delete(`/api/Books/${id}`);
      toast.success('Книга удалена');
      navigate('/books');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Не удалось удалить книгу');
    }
  };

  const getAuthorNames = () => {
    if (!book || !authors.length) return 'Unknown';
    
    return book.authorIds
      .map(authorId => authors.find(a => a.id === authorId)?.authorName || 'Unknown')
      .join(', ');
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="card h-64 p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700">Книга не найдена</h3>
        <p className="text-gray-500 mt-2">Книга, которую вы ищете, не существует или была удалена.</p>
        <Link to="/books" className="btn btn-primary btn-md mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к книгам
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <Link to="/books" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" /> Вернуться к книгам
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="font-bold text-gray-900">{isEditing ? 'Редактирование книги' : book.title}</h1>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-ghost btn-md border border-gray-200"
              >
                Отменить
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary btn-md"
              >
                <Save className="mr-2 h-4 w-4" /> Сохранить изменения
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary btn-md"
              >
                Редактировать книгу
              </button>
              <button 
                onClick={handleDelete}
                className="btn btn-ghost btn-md text-red-600 border border-gray-200"
              >
                <Trash className="mr-2 h-4 w-4" /> Удалить
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN
                </label>
                <input
                  id="isbn"
                  name="isbn"
                  type="text"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Дата публикации
                </label>
                <input
                  id="publishDate"
                  name="publishDate"
                  type="date"
                  value={formData.publishDate ? new Date(formData.publishDate).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Количество
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  Рейтинг
                </label>
                <input
                  id="rating"
                  name="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="authorIds" className="block text-sm font-medium text-gray-700 mb-1">
                  Автор(ы)
                </label>
                <select
                  id="authorIds"
                  name="authorIds"
                  multiple
                  value={formData.authorIds?.map(id => id.toString())}
                  onChange={handleAuthorChange}
                  className="input h-32"
                  required
                >
                  {authors.map(author => (
                    <option key={author.id} value={author.id}>
                      {author.authorName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Зажмите Ctrl/Cmd для выбора нескольких авторов</p>
              </div>
            </div>
            
            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                className="btn btn-primary btn-md"
              >
                <Save className="mr-2 h-4 w-4" /> Сохранить изменения
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="card p-6">
                <h2 className="text-xl font-medium mb-4">Информация о книге</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                  <div className="flex items-start">
                    <BookOpen className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Название</p>
                      <p className="font-medium">{book.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Bookmark className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Автор(ы)</p>
                      <p className="font-medium">{getAuthorNames()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Hash className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">ISBN</p>
                      <p className="font-mono">{book.isbn}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Star className="h-5 w-5 text-amber-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Рейтинг</p>
                      <p className="font-medium">{book.rating.toFixed(1)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Дата публикации</p>
                      <p className="font-medium">
                        {book.publishDate 
                          ? new Date(book.publishDate).toLocaleDateString() 
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Добавить в библиотеку</p>
                      <p className="font-medium">{new Date(book.addmissionDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Package className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Количество</p>
                      <p className="font-medium">{book.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="card p-6">
                <h2 className="text-xl font-medium mb-4">Быстрые действия</h2>
                <div className="space-y-3">
                  <button className="btn btn-primary btn-md w-full justify-start">
                    <Users className="mr-2 h-5 w-5" />
                    Выдать книгу
                  </button>
                  
                  <Link to="/transmissions" className="btn btn-secondary btn-md w-full justify-start">
                    <Clock className="mr-2 h-5 w-5" />
                    Просмотр истории выдачи
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-medium mb-4">История выдачи</h2>
            
            {transmissions.length === 0 ? (
              <div className="card p-6 text-center">
                <p className="text-gray-500">У этой книги нет истории выдачи.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Пользователь</th>
                      <th>Дата выдачи</th>
                      <th>Дата возврата</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transmissions.map((transmission, idx) => (
                      <tr key={idx}>
                        <td>{transmission.userLogin}</td>
                        <td>{new Date(transmission.issuanceDate).toLocaleDateString()}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BookDetails;