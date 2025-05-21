import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, Filter, Star, ChevronLeft, ChevronRight, 
  BookOpen, Trash, PenSquare 
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

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

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/Books');
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Не удалось загрузить книги');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту книгу?')) {
      return;
    }

    try {
      await api.delete(`/api/Books/${id}`);
      toast.success('Книга удалена');
      fetchBooks(); // Refresh the list
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Не удалось удалить книгу');
    }
  };

  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm)
      );
      setFilteredBooks(filtered);
    }
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, books]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-gray-900">Книги</h1>
          <p className="text-gray-600 mt-1">Управление книгами в вашей библиотеке</p>
        </div>
        <button
          onClick={() => setShowBookForm(true)}
          className="btn btn-primary btn-md mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" /> Добавить книгу
        </button>
      </div>

      <div className="card mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию или ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-accent' : 'btn-ghost'} btn-md border border-gray-200`}
          >
            <Filter className="mr-2 h-4 w-4" /> Фильтр
          </button>
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
            {filteredBooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Книги не найдены</h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm.trim() !== '' 
                    ? `Ни одной книги не найдено по запросу "${searchTerm}"`
                    : "Ваша библиотека пуста. Добавьте книги, чтобы начать."}
                </p>
                {searchTerm.trim() !== '' && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="btn btn-ghost btn-sm mt-4 text-blue-600"
                  >
                    Очистить поиск
                  </button>
                )}
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>ISBN</th>
                    <th className="hidden sm:table-cell">Дата добавления</th>
                    <th className="hidden md:table-cell">Количество</th>
                    <th className="hidden md:table-cell">Рейтинг</th>
                    <th>Управление</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((book) => (
                    <tr key={book.id}>
                      <td className="font-medium">
                        <Link to={`/books/${book.id}`} className="hover:text-blue-600">
                          {book.title}
                        </Link>
                      </td>
                      <td className="font-mono text-sm">{book.isbn}</td>
                      <td className="hidden sm:table-cell">{new Date(book.addmissionDate).toLocaleDateString()}</td>
                      <td className="hidden md:table-cell">{book.quantity}</td>
                      <td className="hidden md:table-cell">{renderStarRating(book.rating)}</td>
                      <td>
                        <div className="flex space-x-2">
                          <Link
                            to={`/books/${book.id}`}
                            className="btn btn-ghost btn-sm p-1"
                          >
                            <PenSquare className="h-4 w-4 text-blue-600" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteBook(book.id)}
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
          {filteredBooks.length > 0 && (
            <div className="flex items-center justify-between my-6">
              <div className="text-sm text-gray-600">
                Показывается {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBooks.length)} из {filteredBooks.length} книг
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

export default Books;